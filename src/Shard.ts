// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

import { Shard, ShardingManager } from 'discord.js';
import { join } from 'path';

import { WebhookLogger } from './structures/WebhookLogger';

const webhook: WebhookLogger = WebhookLogger.instance;
webhook.info('Manager Spawn', 'Manager', 'Manager spawned.');

process.on('unhandledRejection', (error: Error) => {
	webhook.error('REJECTION', error);
});

const { clientToken: token }: { clientToken: string } = require('../data');

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token,
});

manager.spawn(manager.totalShards, 5500, false);

manager.on('shardCreate', (shard: Shard) => {
	webhook.info('Shard Create', shard.id, 'Shard created.');
	shard
		.on('death', () => webhook.error('Shard Death', shard.id, 'Shard died.'))
		.on('error', (error: Error) => webhook.error('Shard Error', shard.id, 'Shard errored:', error))
		.on('spawn', () => webhook.info('Shard Spawn', shard.id, 'Shard spawned.'));
});
