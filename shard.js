const Discord = require("discord.js");

let kanna = new Discord.ShardingManager("./core.js",
{
  token: require("./util/settings.json").client.token,
  totalShards: 2
});

kanna.spawn();

kanna.on("launch" , s =>
{
    require('./util/log.js').shard(`Launched Shard ${s.id}!`);
});
