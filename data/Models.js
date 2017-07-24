const fs = require('fs');

const Models = {}

fs.readdir('./data/models', (err, files) => {
    if (err) return console.error(err);
    for (file of files) {
        Models[file.split('.')[0]] = require('./models/' + file);
    }
})

module.exports = Models;
