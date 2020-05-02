import { captureException } from 'raven';

import { APIRouter, buildRouter } from '../structures/Api';
import { Client } from '../structures/Client';
import { Logger } from '../structures/Logger';

/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { dbotsorg }: { [key: string]: string } = require('../../data.json');

const DBotsOrg: () => APIRouter = buildRouter({
	baseURL: 'https://discordbots.org',
	defaultHeaders: {
		accept: 'application/json',
		authorization: dbotsorg,
		'content-type': 'application/json',
	},
});

export async function updateBotLists(this: Client): Promise<void>
{
	const count: number = await this.shard!.broadcastEval((client: Client) => client.guilds.cache.size)
		.then((res: number[]) => res.reduce((p: number, c: number) => p + c));

	// No webhook, that would just spam
	Logger.instance.debug('BotLists', this.shard!.ids[0], `Updating guild count for bot lists to ${count} guilds.`);

	/* eslint-disable-next-line @typescript-eslint/camelcase */
	const data: { server_count: number } = { server_count: count };

	try
	{
		await DBotsOrg().api.bots(this.user!.id).stats.post({ data });
	}
	catch (error)
	{
		captureException(error, {
			/* eslint-disable-next-line @typescript-eslint/camelcase */
			extra: { guild_count: count },
			tags: { service: 'dbotsorg' },
		});

		this.webhook.error('dbotsorg', 'Failed updating guild count:');
	}
}
