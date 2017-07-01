const { bot } = require('../util/log.js');
const superagent = require('superagent');

module.exports = async(client) => {
  setTimeout(() => {
    bot(`Posting guild Count...`);

    superagent
    .post(`https://bots.discord.pw/api/bots/${client.user.id}/stats`)
    .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySUQiOiIyNjc3MjcyMzAyOTYxMjk1MzYiLCJyYW5kIjo2MDUsImlhdCI6MTQ5MTkyMzU0Mn0.70Ihb6mfLmzZz0MiyRYFaqJk7M4ubRL0aGIR32qAKF0")
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
    .set("Authorization", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjI2NzcyNzIzMDI5NjEyOTUzNiIsImlhdCI6MTQ5NDY0NDQ4Mn0.Fdxq947bA28Z4YOKcE3KTLhkfPA-Z9DmTjNIuFfpm8k")
    .send({ server_count: client.guilds.size})
    .then(res => {
      bot(`Sucessfully posted ${client.guilds.size} to Discord Bot List!`);
    })
    .catch((err) => {
      console.log(err);
    });
  }, 1800000);
}
