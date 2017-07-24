const thinky = require('../../util/data/thinky');
const type = thinky.type;

const User = thinky.createModel('User', {
    id: type.number().integer(),
    coins: type.number().integer(),
    experience: type.number().integer()
});

User.define('getLevel', () => Math.floor(Math.sqrt(this.experience / 100)) + 1);

module.exports = User;
