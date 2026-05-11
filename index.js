const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const { buildIndex } = require('./Patterns/IndexBuilder');
const PuppeteerAdapter = require('./Patterns/puppeteerAdapter');
const settings = require('./Jsons/settings.json');
const { readJson } = require('./Utils/helpers');
const { SELECTORS_REL, thankYouSelectorFromMap } = require('./Selectors/registry');
const { buildArgentinaRunPlan } = require('./services/argentinaFormService');
const { runFlowEngine } = require('./Engine/flowEngine');

const DATA_FILE = 'Jsons/ArgentinaForm.json';

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
  const browser = await puppeteer.launch({ headless: process.env.HEADLESS !== 'false' });
  const page = await browser.newPage();

  const adapter = new PuppeteerAdapter(page, indexMap, {
    baseUrl: formDef.website || settings.baseUrl,
    navigationTimeout: settings.navigationTimeout || 5000
  }, selectorsMap);

  await runFlowEngine({ adapter, plan });
  await browser.close();
  return plan.iterations;
}

if (require.main === module) {
  main().then(total => console.log(`Finished ${total} tests.`));
}

module.exports = { main };
