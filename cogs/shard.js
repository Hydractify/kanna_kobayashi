const Discord = require('discord.js');
//const beta = require('../data/client/beta');
const official = require('../data/client/official');

const Kanna = new Discord.ShardingManager('./index.js', {
  token : official.token
});

Kanna.spawn();

Kanna.on('launch', (s) => {
  require('../util/log/shard')(`Launched Shard ${s.id}!`);
});
