import { Shard, ShardingManager } from 'discord.js';
import { join } from 'path';

import { Logger } from './structures/Logger';

const { clientToken }: { clientToken: string } = require('../data');
const logger: Logger = Logger.instance;

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token: clientToken,
});

manager.spawn();

manager.on('shardCreate', (shard: Shard) => {
	logger.info('SHARDING-MANGER', `Created shard: ${shard.id}.`);
	shard.on('death', () => logger.info('SHARDING-MANGER', `Shard ${shard.id} died.`))
		.on('error', logger.error.bind(logger, 'SHARDING-MANGER', `Shard ${shard.id}: `))
		.on('spawn', () => logger.info('SHARDING-MANGER', `Shard ${shard.id} spawned.`));
});
