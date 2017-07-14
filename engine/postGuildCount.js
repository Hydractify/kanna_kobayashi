const { bot } = require('../util/log.js');
const superagent = require('superagent');
const settings = require('../util/settings');

module.exports = async(client) => {
  setTimeout(() => {
    bot(`Posting guild Count...`);

    superagent
    .post(`https://bots.discord.pw/api/bots/${client.user.id}/stats`)
    .set("Authorization", settings.keys.dbots)
    .set("Accept", "application/json")
    .send({ server_count: client.guilds.size })
    .then(res => {
      bot(`Sucessfully posted ${client.guilds.size} to Discord Bots!`);
    })
    .catch((err) => {
      console.log(err);
    });

    superagent
    .post(`https://discordbots.org/api/bots/${client.user.id}/stats`)
    .set("Authorization", settings.keys.fakedbots)
    .send({ server_count: client.guilds.size})
    .then(res => {
      bot(`Sucessfully posted ${client.guilds.size} to Discord Bot List!`);
    })
    .catch((err) => {
      console.log(err);
    });
  }, 1800000);
}
