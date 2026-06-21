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
const logger=require('./Patterns/logger')
const DATA_FILE = 'Jsons/ACMEform.json';


function buildTestCaseByIndex(index, data) {
  const result = {};

  for (const key of Object.keys(data)) {
    const values = data[key]?.values || [];

    result[key] =
        values[index] ??
        values[0] ??
        '';
    logger.info({"key": result[key]})
  }

  return result;
}
async function main() {
  const selectorsMap = readJson(SELECTORS_REL);
  const indexMap = buildIndex(DATA_FILE, SELECTORS_REL);
  const formDef = readJson(DATA_FILE);

  const modeIndex = parseInt(process.argv[2], 10) || 2;
  // 2 = stable guaranteed case

  console.log(`Running MODE INDEX: ${modeIndex}`);

  const dir = path.join(process.cwd(), settings.screenshotsDir || 'screenshots');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch({ headless: process.env.HEADLESS !== 'false' });
  const context = await browser.newContext();
  const page = await context.newPage();

  const adapter = new PlaywrightAdapter(
      page,
      indexMap,
      {
        baseUrl: settings.baseUrl,
        navigationTimeout: settings.navigationTimeout || 5000,
        thankYouSelector: thankYouSelectorFromMap(selectorsMap),
        submitTimeout: (settings.navigationTimeout || 5000) * 6,
        screenshotDir: dir,
        settleMs: 400
      },
      selectorsMap
  );

  try {
    const testCase = buildTestCaseByIndex(modeIndex, indexMap);

    await runFlowEngine({
      adapter,
      testCase
    });

  } catch (error) {
    console.error(error);
  }

  try {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
  } catch (e) {}

  console.log(`Finished single run (mode=${modeIndex})`);
}


if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
