/**
 * Standalone script used in order to sync commands to either a guild (read: development) or globally (read: production).
 */

import { Buffer } from 'node:buffer';
import { readFile, writeFile } from 'node:fs/promises';
import { stringify } from 'node:querystring';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import * as groups from '../commands/index.js';
import { registerConfig } from '../config.js';

const { DISCORD_COMMAND_GUILD_ID, DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, CACHE_FILE_PATH } = registerConfig();

const rest = new REST({
	version: '10',
	// Always throw
	rejectOnRateLimit: () => true,
});

console.info('Obtaining access token in order to update commands.');

const { access_token, token_type } = await obtainToken();

rest.setToken(access_token);

const route =
	DISCORD_COMMAND_GUILD_ID === 'GLOBAL'
		? Routes.applicationCommands(DISCORD_CLIENT_ID)
		: Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_COMMAND_GUILD_ID);

const commands = Object.values(groups)
	.flatMap((group) => Object.values(group))
	.map((command) => command.data);

console.info(`Syncing commands ${commands.length} to ${DISCORD_COMMAND_GUILD_ID ?? 'GLOBAL'}.`);

await rest.put(route, {
	authPrefix: token_type as 'Bearer',
	body: commands,
});

console.info(`Synced commands.`);

async function obtainToken() {
	try {
		const data = JSON.parse(await readFile(CACHE_FILE_PATH, 'utf8'));
		if (data.access_token && data.token_type && data.expires_at && data.client_id) {
			if (data.expires_at <= Date.now()) {
				console.warn('Cached access token expired.');
				// eslint-disable-next-line no-negated-condition
			} else if (data.client_id !== DISCORD_CLIENT_ID) {
				console.warn('Cached access token is valid for another client.');
			} else {
				console.info('Using cached access token.');
				return data;
			}
		}
	} catch {}

	console.info('Exchanging for a new access token.');

	const data = (await rest.post(Routes.oauth2TokenExchange(), {
		auth: false,
		headers: {
			authorization: `Basic ${Buffer.from(`${DISCORD_CLIENT_ID}:${DISCORD_CLIENT_SECRET}`, 'utf8').toString('base64')}`,
			'content-type': 'application/x-www-form-urlencoded; charset=utf8',
		},
		passThroughBody: true,
		body: stringify({
			grant_type: 'client_credentials',
			scope: 'applications.commands.update',
		}),
	})) as { access_token: string; expires_in: number; token_type: string };

	await writeFile(
		CACHE_FILE_PATH,
		JSON.stringify({
			access_token: data.access_token,
			token_type: data.token_type,
			expires_at: data.expires_in * 1_000 + Date.now(),
			client_id: DISCORD_CLIENT_ID,
		}),
	);
	console.info('Cached access token.');

	return data;
}
