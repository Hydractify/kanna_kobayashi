const Discord = require("discord.js");

let kanna = new Discord.ShardingManager("./core.js",
{
  token: require("./util/settings.json").client.token
});

kanna.spawn();

kanna.on("launch" , s =>
{
    require('./util/log.js').shard(`Launched Shard ${s.id}!`);
});
