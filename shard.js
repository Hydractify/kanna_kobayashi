const Discord = require("discord.js");
const settings = require("./util/settings.js");
const log = require('./util/log.js');

let kanna = new Discord.ShardingManager("./core.js" , {
  token: settings.client.token
});
kanna.spawn();
kanna.on("launch" , s => {
    log.bot(`Launched Shard ${s.id}!`);
});
