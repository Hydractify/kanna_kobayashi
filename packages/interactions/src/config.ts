import { Buffer } from 'node:buffer';
import process from 'node:process';
import { URL } from 'node:url';

export const PORT = Number.parseInt(must('PORT'), 10);

export const SENTRY_DSN = process.env.SENTRY_DSN;
export const WEEB_SH_TOKEN = process.env.WEEB_SH_TOKEN;

export const DISCORD_PUBLIC_KEY = Buffer.from(must('DISCORD_PUBLIC_KEY'), 'hex');

// Required when registering commands, don't throw when we don't care about it
export function registerConfig() {
	return {
		DISCORD_CLIENT_ID: must('DISCORD_CLIENT_ID'),
		DISCORD_CLIENT_SECRET: must('DISCORD_CLIENT_SECRET'),
		CACHE_FILE_PATH: new URL('../.access_token.json', import.meta.url),
		// if GLOBAL, commands will be deployed globally
		DISCORD_COMMAND_GUILD_ID: must('DISCORD_COMMAND_GUILD_ID'),
	};
}

function must(key: string): string {
	const value = process.env[key];

	if (!value) {
		throw new Error(`Missing required configuration option: ${key}`);
	}

	return value;
}
