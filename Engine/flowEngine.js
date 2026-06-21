const logger = require('../Patterns/logger');

async function runFlowEngine({ adapter, testCase }) {
  await adapter.goToForm();
  await adapter.fillForm(testCase);

  await adapter.submit();

  const ok = Boolean(await adapter.isThankYouPage?.());

  console.log(ok ? 'PASS' : 'FAIL');

  if (!ok) await adapter.clearForm();
}
module.exports = { runFlowEngine };