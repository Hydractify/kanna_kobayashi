import { captureException } from 'raven';

import { APIRouter, buildRouter } from '../structures/Api';
import { Client } from '../structures/Client';
import { Logger } from '../structures/Logger';

const { dbotsorg }: { [key: string]: string } = require('../../data.json');

// tslint:disable-next-line:variable-name
const DBotsOrg: () => APIRouter = buildRouter({
	baseURL: 'https://discordbots.org',
	defaultHeaders: {
		accept: 'application/json',
		authorization: dbotsorg,
		'content-type': 'application/json',
	},
});

export async function updateBotLists(this: Client): Promise<void> {
	const count: number = this.guilds.size;

	// No webhook, that would just spam
	Logger.instance.debug('BotLists', `Updating guild count for bot lists to ${count} guilds.`);

	const data: { server_count: number } = { server_count: count };

	try {
		await DBotsOrg().api.bots(this.user!.id).stats.post({ data });
	} catch (error) {
		captureException(error, {
			extra: { guild_count: count },
			tags: { service: 'dbotsorg' },
		});

		this.webhook.error('dbotsorg', 'Failed updating guild count:');
	}
}
