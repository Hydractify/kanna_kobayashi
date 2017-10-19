const { ShardingManager } = require('discord.js');
const { join } = require('path');

const { clientToken } = require('./data');
const Logger = require('./structures/Logger');

const manager = new ShardingManager(join(__dirname, 'index.js'), {
	totalShards: 'auto',
	respawn: true,
	token: clientToken
});

manager.spawn();

manager.on('launch', shard => Logger.instance.shard('Launched Shard', shard.id));
