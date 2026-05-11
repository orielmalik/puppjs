const IFormAdapter = require('../Patterns/IFormAdapter');
const path = require('path');
const { readJson } = require('../Utils/helpers');
const logger = require('../Patterns/logger');
const { createGetSelector } = require('../Utils/selectorBuilders');
const { navigate, type, click, snapshot, queryHandle, puppeteerXPathQuery } = require('../Actions/puppeteerActions');

const SETTINGS = readJson(path.join(__dirname, '../Jsons/settings.json'));
const TEST_DATA = readJson(path.join(__dirname, '../Jsons/ArgentinaForm.json'));

class PuppeteerAdapter extends IFormAdapter {

  constructor(page, index, options = {}, selectors) {
    super();
    this.page = page;
    this.index = index || {};
    this.baseUrl = options.baseUrl || null;
    this.navigationTimeout = options.navigationTimeout || (SETTINGS && SETTINGS.navigationTimeout) || 5000;
    this.timeout = this.navigationTimeout;
    this.getSelector = createGetSelector(selectors);
  }

  async safe(action, fn, context = '') {
    try {
      logger.info({action :context});

      return await fn();
    } catch (err) {
      logger.error({
        action,
        context,
        error: err && err.message ? err.message : String(err)
      });
      return null;
    }
  }

  getSelectorForKey(key) {
    const k = key.toLowerCase().replace(/\s+/g, '');
    const entry = this.index[k];
    if (!entry) throw new Error(`Missing selector for field: ${key}`);
    return entry.selector;
  }

  async goToForm() {
    const url = this.baseUrl || (TEST_DATA && TEST_DATA.website) || SETTINGS.baseUrl;
    return this.safe('GOTO', () => navigate(this.page, url, 'networkidle2'));
  }

  async smartType(key, value) {
    const rawSelector = this.getSelector(key);
    return this.safe(`TYPE:${key}`, () => type(this.page, rawSelector, value, this.timeout));
  }

  async smartClick(rawSelector, options = {}) {
    const { retries = 2 } = options;
    return this.safe(`CLICK`, () => click(this.page, rawSelector, this.timeout, retries));
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

  async selectEmployees(value = SETTINGS.employeesValue || '51-500') {
    const selector = this.getSelector('employees');
    return this.safe('SELECT_EMPLOYEES', async () => {
      if (selector.startsWith('xpath=')) {
        const xpath = selector.replace(/^xpath=/, '');
        const q = puppeteerXPathQuery(xpath);
        await this.page.waitForSelector(q, { timeout: this.timeout });
        const els = await this.page.$$(q);
        if (!els || !els[0]) return null;
        const selHandle = els[0];
        await this.page.evaluate((el, val) => {
          for (const opt of Array.from(el.options || [])) {
            if (opt.value === val || opt.text === val) { el.value = opt.value; el.dispatchEvent(new Event('change', { bubbles: true })); return; }
          }
        }, selHandle, value);
        await selHandle.dispose();
        return null;
      }
      return this.page.select(selector, value);
    }, 'employees');
  }

  async takeScreenshot(fileName, settleMs) {
    const dir = SETTINGS.screenshotsDir || 'screenshots';
    const filePath = fileName || `${dir}/screenshot_${Date.now()}.jpg`;
    return this.safe('SCREENSHOT', () => snapshot(this.page, filePath, settleMs), filePath);
  }

  async submitAndWait(thankYouSelector = null, timeout = this.navigationTimeout * 6) {
    const raw = this.getSelectorForKey('primary button');
    await this.smartClick(raw);

    if (thankYouSelector) {
      try {
        await this.page.waitForSelector(thankYouSelector, { timeout });
        return true;
      } catch (e) {
        return false;
      }
    }

    try {
      await this.page.waitForNavigation({ timeout });
      return true;
    } catch (e) {
      return await this.isThankYouPage();
    }
  }

  async isThankYouPage() {
    const raw = this.getSelectorForKey('name');
    const el = await queryHandle(this.page, raw);
    if (el) {
      await el.dispose();
    }
    return !el;
  }

  async clearForm() {
    for (const key of Object.keys(this.index)) {
      if (key === 'primarybutton' || key === 'employees') continue;
      const selector = this.index[key].selector;
      await this.safe('CLEAR', async () => {
        if (selector.startsWith('xpath=')) {
          const xpath = selector.replace(/^xpath=/, '');
          const q = puppeteerXPathQuery(xpath);
          const els = await this.page.$$(q);
          if (els && els[0]) {
            await this.page.evaluate(el => { el.value = ''; }, els[0]);
            await els[0].dispose();
          }
        } else {
          await this.page.$eval(selector, el => { if ('value' in el) el.value = ''; });
        }
      }, key);
    }
  }
}

module.exports = PuppeteerAdapter;
