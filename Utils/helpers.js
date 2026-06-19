const fs   = require('fs');
const path = require('path');

function readJson(relativePath) {
    const absolute = path.resolve(__dirname, '..', relativePath);
    return JSON.parse(fs.readFileSync(absolute, 'utf-8'));
}

function forceString(input) {
    if (typeof input === 'string') return input;
    if (input === null || input === undefined) return '';

    if (Array.isArray(input)) {
        for (const item of input) {
            const res = forceString(item);
            if (res) return res;
        }
        return '';
    }

    if (typeof input === 'object') {
        const priorities = ['values', 'value', 'selector', 'url', 'urll', 'website'];
        for (const key of priorities) {
            if (key in input) {
                const res = forceString(input[key]);
                if (res) return res;
            }
        }

        for (const key in input) {
            if (Object.prototype.hasOwnProperty.call(input, key)) {
                const res = forceString(input[key]);
                if (res) return res;
            }
        }
    }

    const str = String(input);
    return str.includes('[object') ? '' : str;
}

module.exports = { readJson,forceString };


