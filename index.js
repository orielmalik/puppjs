const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const { buildIndex } = require('./Patterns/IndexBuilder');
const PlaywrightAdapter = require('./Patterns/playwrightAdapter');
const settings = require('./Jsons/settings.json');
const { readJson } = require('./Utils/helpers');
const { SELECTORS_REL, thankYouSelectorFromMap } = require('./Selectors/registry');
const { buildArgentinaRunPlan } = require('./services/ACMEService');
const { runFlowEngine } = require('./Engine/flowEngine');

const DATA_FILE = 'Jsons/ACMEform.json';

const requestedCount = parseInt(process.argv[2], 10) || 1;
const requestedMode = (process.argv[3] || 'PASS').toUpperCase();

async function main() {
  const selectorsMap = readJson(SELECTORS_REL);
  const indexMap = buildIndex(DATA_FILE, SELECTORS_REL);
  const plan = buildArgentinaRunPlan({
    requestedCount,
    requestedMode,
    settings,
    indexMap,
    thankYouSelector: thankYouSelectorFromMap(selectorsMap)
  });

  console.log(`FSM Mode: ${requestedMode} | Total Tests to run: ${plan.iterations}`);

  const dir = path.join(process.cwd(), settings.screenshotsDir || 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  plan.screenshotDir = dir;
  plan.settleMs = 400;
  plan.submitTimeout = (settings.navigationTimeout || 5000) * 6;

  const formDef = readJson(DATA_FILE);
  const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const adapter = new PlaywrightAdapter(page, indexMap, {
    baseUrl: settings.baseUrl,
    navigationTimeout: settings.navigationTimeout || 5000,
    thankYouSelector: plan.thankYouSelector,
    submitTimeout: plan.submitTimeout,
    screenshotDir: plan.screenshotDir,
    settleMs: plan.settleMs
  }, selectorsMap);

  try {
    await runFlowEngine({ adapter, plan });
  } catch (error) {
    console.error(error);
  } finally {
    try {
      if (context) await context.close();
      if (browser) await browser.close();
    } catch (closeError) {
      console.warn(closeError);
    }
  }

  return plan.iterations;
}

if (require.main === module) {
  main().then(total => console.log(`Finished ${total} tests.`)).catch(console.error);
}

module.exports = { main };
