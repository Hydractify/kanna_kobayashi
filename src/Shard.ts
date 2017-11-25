import { Shard, ShardingManager } from 'discord.js';
import { join } from 'path';

import { Logger } from './structures/Logger';

const { clientToken }: { clientToken: string } = require('../data');

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token: clientToken,
});

manager.spawn();

manager.on('shardCreate', (shard: Shard) => {
	Logger.instance.info('');
});
