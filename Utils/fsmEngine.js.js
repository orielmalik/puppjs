const logger =
    require('../Patterns/logger');

async function runFSM(
    scenarios,
    adapter
) {

  for (let i = 0; i < scenarios.length; i++) {

    const scenario =
        scenarios[i];

    const testCase =
        scenario.testCase || scenario;

    const type =
        scenario.type || 'DIRECT';

    try {

      logger.info({
        scenario: i + 1,
        type,
        status: 'STARTED'
      });

      await adapter.fillForm(
          testCase
      );

      await adapter.selectEmployees(
          testCase.employees || '1-10'
      );

      await adapter.takeScreenshot(i);

      const submitSuccess =
          await adapter.submit();

      const onThankYou =
          submitSuccess &&
          await adapter.isThankYouPage();
      if(onThankYou){
        await adapter.takeScreenshot(i*10);

      }

      logger.info({
        scenario: i + 1,
        type,
        result: onThankYou
            ? 'PASS'
            : 'FAIL'
      });

      if (onThankYou) {

        await adapter.goToForm();

      } else {

        await adapter.clearForm();
      }

    } catch (error) {

      logger.error({
        scenario: i + 1,
        error: error.message
      });

      await adapter.goToForm();
    }
  }
}

module.exports = {
  runFSM
};

module.exports = {
  runFSM
};