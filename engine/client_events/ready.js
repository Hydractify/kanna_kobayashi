const moment = require('moment');

module.exports = client => {
  if(!client.user.presence.game) client.user.setGame(`k!help | on ${client.guilds.size} guilds`);
  require('../../util/log.js').bot(`Logged in as ${client.user.tag} (${client.user.id}) at ${moment().format('HH:mm')} [${moment().format('DD/MM/YYYY')}]`);
}
