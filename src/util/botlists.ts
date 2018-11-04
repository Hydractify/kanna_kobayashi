import { captureException } from 'raven';

import { APIRouter, buildRouter } from '../structures/Api';
import { Client } from '../structures/Client';
import { Logger } from '../structures/Logger';

const { dbots, dbotsorg }: { [key: string]: string } = require('../../data.json');

/* tslint:disable variable-name */
const DBots: () => APIRouter = buildRouter({
	baseURL: 'https://bots.discord.pw',
	defaultHeaders: {
		accept: 'application/json',
		authorization: dbots,
		'content-type': 'application/json',
	},
});

const DBotsOrg: () => APIRouter = buildRouter({
	baseURL: 'https://discordbots.org',
	defaultHeaders: {
		accept: 'application/json',
		authorization: dbotsorg,
		'content-type': 'application/json',
	},
});
/* tslint:enable variable-name */

export async function updateBotLists(this: Client): Promise<void> {
	const count: number = await this.shard.fetchClientValues('guild.size')
		.then((res: number[]) => res.reduce((p: number, c: number) => p + c));

	// No webhook, that would just spam
	Logger.instance.debug('BotLists', `Updating guild count for bot lists to ${count} guilds.`);

	const data: { server_count: number } = { server_count: count };
	try {
		await DBots().api.bots(this.user.id).stats.post({ data });
	} catch (error) {
		captureException(error, {
			extra: { guild_count: count },
			tags: { service: 'dbots' },
		});

		this.webhook.error('dbots', 'Failed updating guild count:');
	}

	try {
		DBotsOrg().api.bots(this.user.id).stats.post({ data });
	} catch (error) {
		captureException(error, {
			extra: { guild_count: count },
			tags: { service: 'dbotsorg' },
		});

		this.webhook.error('dbotsorg', 'Failed updating guild count:');
	}
}
