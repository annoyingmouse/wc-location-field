const fs = require('fs');

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const bower = JSON.parse(fs.readFileSync('bower.json', 'utf8'));

bower.version = pkg.version;

fs.writeFileSync('bower.json', JSON.stringify(bower, null, 2) + '\n');
