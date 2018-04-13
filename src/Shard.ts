// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

import { Shard, ShardingManager } from 'discord.js';
import { join } from 'path';

import { Logger } from './structures/Logger';

process.on('unhandledRejection', (error: Error) => {
	Logger.instance.error('REJECTION', error);
});

import { WebhookLogger } from './structures/WebhookLogger';

const { clientToken }: { clientToken: string } = require('../data');
const webhook: WebhookLogger = WebhookLogger.instance;

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token: clientToken,
});

manager.spawn(manager.totalShards, 5500, false);

manager.on('shardCreate', (shard: Shard) => {
	webhook.info('Shard Create', `Shard \`${shard.id}\` created.`);
	shard
		.on('death', () => webhook.error('Shard Death', `Shard \`${shard.id}\` died.`))
		.on('error', (error: Error) => webhook.error('Shard Error', `Shard \`${shard.id}\`: `, error))
		.on('spawn', () => webhook.info('Shard Spawn', `Shard \`${shard.id}\` spawned.`));
});
