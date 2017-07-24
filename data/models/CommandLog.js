const thinky = require('../../util/data/thinky');
const type = thinky.type;

var CommandLog = thinky.createModel("CommandLog", {
    id: type.string(),
    userId: type.string(),
    command: type.string(),
    lastUsed: type.date()
});

module.exports = CommandLog;

const User = require('./User');
CommandLog.belongsTo(User, 'user', 'userId', 'id');
