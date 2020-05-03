// tslint:disable-next-line:no-import-side-effect no-submodule-imports
import 'source-map-support/register';

import { Shard, ShardingManager } from 'discord.js';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { join } from 'path';
import { AggregatorRegistry, register } from 'prom-client';
import { parse } from 'url';

import { WebhookLogger } from './structures/WebhookLogger';
import { IPCMessageType } from './types/IPCMessageType';

const webhook: WebhookLogger = WebhookLogger.instance;
webhook.info('Manager Spawn', 'Manager spawned.');

process.on('unhandledRejection', (error: {} | null | undefined) => webhook.error('REJECTION', error));

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { clientToken: token, httpPort }: { clientToken: string; httpPort: number } = require('../data');

const manager: ShardingManager = new ShardingManager(join(__dirname, 'index.js'), {
	token,
});

manager.spawn(manager.totalShards, 5500, Infinity);

manager.on('shardCreate', (shard: Shard) =>
{
	const shardID: number = shard.id;
	webhook.info(`Shard Create [${shardID}]`, 'Shard created.');
	shard
		.on('message', message =>
		{
			if (message.__kanna__ !== true) return;
			switch (message.type)
			{
				case IPCMessageType.RESTART: {
					const shard: Shard | undefined = manager.shards.get(message.target);
					if (shard)
					{
						shard.respawn(500, Infinity);
					}
					else
					{
						webhook.warn(`IPCMESSAGE [${shardID}]`, `Received a restart request for an unknown shard: ${message.target}`);
					}
					break;
				}

				case IPCMessageType.RESTART_ALL:
					manager.respawnAll(5500, 500, Infinity);
					break;

				default:
					webhook.warn(`IPCMESSAGE [${shardID}]`, `Received an unexpected message type: ${message.type}`);
					break;
			}
		})
		.on('death', () => webhook.warn(`Shard Death [${shardID}]`, 'Shard died.'))
		.on('error', (error: Error) => webhook.error(`Shard Error [${shardID}]`, 'Shard errored:', error))
		.on('spawn', () => webhook.warn(`Shard Spawn [${shardID}]`, 'Shard spawned.'));
});

createServer(async (req: IncomingMessage, res: ServerResponse): Promise<void> =>
{
	try
	{
		if (parse(req.url ?? '').pathname === '/metrics')
		{
			const metrics: object[][] = await manager.broadcastEval('this.getMetrics()');
			res.writeHead(200, { 'content-type': register.contentType });
			res.write(AggregatorRegistry.aggregate(metrics).metrics());
		}
		else
		{
			res.writeHead(404, { 'content-type': register.contentType });
			res.write('Route not found');
		}
	}
	catch (e)
	{
		webhook.error('Prometheus', e);

		res.writeHead(500, { 'content-type': register.contentType });
		res.write('Internal Server Error');
	}
	res.end();
}).listen(httpPort, () => webhook.info('Prometheus', 'Listening for requests...'));
