const path = require('path');
const IFormAdapter = require('../Patterns/IFormAdapter');
const { readJson, forceString} = require('../Utils/helpers');
const logger = require('../Patterns/logger');
const { createGetSelector } = require('../Utils/selectorBuilders');
const {
  navigate,
  type,
  click,
  snapshot,
  queryHandle,
  playwrightXPathQuery
} = require('../Actions/playwrightActions');

const SETTINGS = readJson(path.join(__dirname, '../Jsons/settings.json'));
const TEST_DATA = readJson(path.join(__dirname, '../Jsons/ACMEform.json'));

class PlaywrightAdapter extends IFormAdapter {

  constructor(page, index, options = {}, selectors) {
    super();
    this.page = page;
    this.index = index || {};
    this.currentScenarioIndex = 0;
    this.baseUrl = options.baseUrl || null;
    this.navigationTimeout = options.navigationTimeout || (SETTINGS && SETTINGS.navigationTimeout) || 5000;
    this.timeout = this.navigationTimeout;
    this.thankYouSelector = options.thankYouSelector || null;
    this.submitTimeout = options.submitTimeout || this.navigationTimeout * 6;
    this.screenshotDir = options.screenshotDir || 'screenshots';
    this.settleMs = options.settleMs || 400;
    this.getSelector = createGetSelector(selectors);
  }

  async safe(action, fn, context = '') {
    try {
      logger.info({ action: context });
      return await fn();
    } catch (err) {
      logger.error({
        action,
        context,
        error: err?.stack || err?.message || String(err)
      });

      throw err;
    }
  }
  getSelectorForKey(key) {
    const k = key.toLowerCase().replace(/\s+/g, '');
    const entry = this.index[k];
    if (!entry) throw new Error(`Missing selector for field: ${key}`);
    return entry.selector;
  }

  async goToForm() {
    let url = this.baseUrl || (SETTINGS && SETTINGS.baseUrl);

    return this.safe('GOTO', () => navigate(this.page, forceString(url).trim(), 'networkidle2'));
  }
  async smartType(key, value) {
    const rawSelector = this.getSelector(key);
    return this.safe(`TYPE:${key}`, () => type(this.page, rawSelector, value, this.timeout));
  }

  async smartClick(rawSelector, options = {}) {
    const { retries = 2 } = options;

    let processedSelector = rawSelector;
    if (rawSelector.startsWith('xpath=')) {
      const xpath = rawSelector.replace(/^xpath=/, '');
      processedSelector = playwrightXPathQuery(xpath);
    }

    return this.safe('CLICK', () => click(this.page, processedSelector, this.timeout, retries));
  }
  async fillField(fieldKey, value) {
    try {
      const ok = await this.smartType(fieldKey, value);
      return !!ok;
    } catch (err) {
      logger.error({ action: 'FILL_FIELD', fieldKey, error: err && err.message ? err.message : String(err) });
      return false;
    }
  }
  async fillForm(testCase) {
    if (!testCase) {
      throw new Error('fillForm requires testCase');
    }

    for (const key of Object.keys(this.index)) {
      if (key.endsWith('button')) continue;

      const fieldData = this.index[key];
      if (!fieldData?.selector) continue;

      const finalValue = String(testCase[key] ?? '');

      if (key === 'employees') {
        await this.selectEmployees(finalValue);
      } else {
        await this.safe(
            `TYPE:${key}`,
            async () => {
              await this.page.waitForSelector(fieldData.selector, {
                state: 'visible',
                timeout: this.timeout || 8000
              });

              return await type(
                  this.page,
                  fieldData.selector,
                  finalValue,
                  this.timeout
              );
            },
            finalValue
        );
      }


    }
  }
  async selectEmployees(value = SETTINGS.employeesValue || '51-500') {
    const selector = this.getSelector('employees');
    return this.safe('SELECT_EMPLOYEES', async () => {
      if (selector.startsWith('xpath=')) {
        const xpath = selector.replace(/^xpath=/, '');
        const locator = this.page.locator(playwrightXPathQuery(xpath));
        await locator.waitFor({ state: 'visible', timeout: this.timeout });
        await locator.selectOption({ label: value }).catch(async () => {
          await locator.selectOption({ value });
        });
        return null;
      }
      const locator = this.page.locator(selector);
      await locator.waitFor({ state: 'visible', timeout: this.timeout });
      await locator.selectOption(value);
      return null;
    }, 'employees');
  }

  async captureScreenshot(filePath, settleMs) {
    return this.safe('SCREENSHOT', () => snapshot(this.page, filePath, settleMs), filePath);
  }

  async takeScreenshot(indexOrFileName, settleMs = this.settleMs) {
    const dir = this.screenshotDir;


    let fileName;

    if (typeof indexOrFileName === 'number') {
      fileName = `screenshot_${indexOrFileName + 1}.png`;
    } else if (typeof indexOrFileName === 'string' && indexOrFileName.length > 0) {
      fileName = indexOrFileName;
    } else {
      fileName = `screenshot_${Date.now()}.png`;
    }

    fileName = path.basename(fileName);

    const filePath = path.join(dir, fileName);

    return this.captureScreenshot(filePath, settleMs);
  }

  async submit() {
    const raw = this.getSelectorForKey('primary button');

    await this.page.waitForTimeout(150);

    await this.takeScreenshot(`beforeClick.png`);

    await this.smartClick(raw);

    await this.page.waitForLoadState('domcontentloaded');

    await this.page.waitForTimeout(200);
  }

  async isThankYouPage() {
    try {
      const title = await this.page.title();

      await this.takeScreenshot(`AfterClick.png`);

      const backToHomeButton = this.page.getByRole('link', {
        name: /back to home/i
      });

      const isButtonVisible = await backToHomeButton.isVisible().catch(() => false);

      return title?.toLowerCase().includes('thank you') && isButtonVisible;

    } catch (e) {
      return false;
    }
  }
  async formExists() {
    try {
      return (await this.page.locator('#name').count()) > 0;
    } catch (e) {
      return false;
    }
  }

  async clearForm() {
    const exists = await this.formExists();
    if (!exists) {
      logger.info({ action: 'CLEAR_SKIPPED_NO_FORM' });
      return;
    }

    for (const key of Object.keys(this.index)) {
      if (key === 'primarybutton' || key === 'employees') continue;

      const selector = this.index[key].selector;

      await this.safe('CLEAR', async () => {

        let locator;

        if (selector.startsWith('xpath=')) {
          const xpath = selector.replace(/^xpath=/, '');
          locator = this.page.locator(playwrightXPathQuery(xpath));
        } else {
          locator = this.page.locator(selector);
        }

        const count = await locator.count();
        if (count === 0) return;

        const el = locator.first();

        await el.fill('');

      }, key);
    }
  }
}

module.exports = PlaywrightAdapter;
