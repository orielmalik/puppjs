const { readJson } = require('../Utils/helpers');
const logger=
    require('../Patterns/logger');

function createGetSelector(selectors) {
  return function getSelector(fieldName) {
    const key = fieldName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '');

    const selector = selectors[key];
    logger.info({selector:selectors[key]})
    if (!selector) {
      throw new Error(`Missing selector for: ${fieldName}`);
    }

    return selector;
  };
}

module.exports = { createGetSelector };