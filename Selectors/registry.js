const path = require('path');

const SELECTORS_REL = path.join(__dirname, '../Jsons/ARselectors.json');

function thankYouSelectorFromMap(map) {
    return map?.thankYou || 'default-selector';
}

module.exports = {
    SELECTORS_REL,
    thankYouSelectorFromMap
};