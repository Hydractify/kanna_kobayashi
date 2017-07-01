const moment = require('moment');

module.exports = client => {
  require('../../util/log.js').bot(`Logged in as ${client.user.tag} (${client.user.id}) at ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]`)
}
