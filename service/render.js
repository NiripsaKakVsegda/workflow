const hbs = require("hbs");
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);

async function render(file, params) {
    const content = await readFile(file, 'utf8');
    const template = hbs.compile(content);

    return template(params);
}

module.exports = render;