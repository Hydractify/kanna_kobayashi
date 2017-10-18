const { ShardingManager } = require('discord.js');
const { join } = require('path');

const Data = require('./data');
const Logger = require('./structures/Logger');

const manager = new ShardingManager(join(__dirname, 'index.js'), {
	totalShards: 'auto',
	respawn: true,
	token: Data.clientToken
});

manager.spawn();

manager.on('launch', shard => Logger.instance.shard('Launched Shard', shard.id));
