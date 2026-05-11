const { readJson } = require('../Utils/helpers');
const logger =
    require('../Patterns/logger');

function normalize(key) {
    return key
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '');
}
function buildIndex(dataPath, selectorsPath) {

    const data = readJson(dataPath);
    const selectors = readJson(selectorsPath);

    const index = {};
    for (const field of Object.keys(data)) {

        if (field === 'website' || field === 'defaults') continue;

        const key = normalize(field);

        let selector = selectors[key];
        if (!selector && !key.endsWith("button")) {
            logger.error({ errorAt: key });
            throw new Error(`Missing selector for field: ${key}`);
        }
        if (selector && typeof selector === 'object') {
            selector = selector.selector || selector.value;
        }

        if (!selector && key.endsWith("button")) {
            selector = `xpath=//button[contains(., '${field}')]`;
        }

        if (typeof selector !== 'string') {
            throw new Error(`Selector must be string for field: ${field}`);
        }

        index[key] = {
            selector,
            values: data[field]
        };
        logger.info({"index[key]": index[key]});
    }

    return index;
}
module.exports = { buildIndex };