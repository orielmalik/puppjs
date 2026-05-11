const fs   = require('fs');
const path = require('path');

function readJson(relativePath) {
    const absolute = path.resolve(__dirname, '..', relativePath);
    return JSON.parse(fs.readFileSync(absolute, 'utf-8'));
}

module.exports = { readJson };


