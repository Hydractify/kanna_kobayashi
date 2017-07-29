const thinky = require('../../util/data/thinky');
const type = thinky.type;

const User = thinky.createModel('User', {
    id: type.string(),
    coins: type.number().integer().default(0),
    exp: type.number().integer().default(0)
});

User.define('getLevel', function() {
    return Math.floor(Math.sqrt(this.exp / 1000)) + 1
});

module.exports = User;
