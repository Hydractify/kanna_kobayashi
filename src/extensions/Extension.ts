// tslint:disable:typedef only-arrow-functions ban-types interface-name

import { readdirSync } from 'fs';
import { basename, extname } from 'path';

import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';

export async function extendAll(): Promise<void> 
{
	// This _HAS_ to be blocking due race conditions with discord.js
	const files: string[] = readdirSync(__dirname);
	for (const file of files) 
	{
		if (extname(file) !== '.js') continue;
		if (file === basename(__filename)) continue;
		const { Extension, Target }: {
			Extension: Function;
			Target: Function;
		} = require(`./${file}`);

		Object.defineProperties(
			Target.prototype,
			Object.getOwnPropertyDescriptors(Extension.prototype),
		);
	}
}

declare module 'discord.js' {
	interface Guild {
		model: GuildModel;

		fetchModel(): Promise<GuildModel>;
	}

	interface Emoji {
		readonly CreatedAt: Date;
		readonly createdTimestamp: number;
	}

	interface User {
		fetchModel(): Promise<UserModel>;
	}

	interface ShardClientUtil {
		broadcastEval<T, U extends Client>(fn: (client: U) => T,
		): T extends Promise<any>
			? T extends Promise<infer U> ? U : any
			: Promise<T[]>;
		broadcastEval<T, S, U extends Client>(
			fn: (client: U, args: S[]) => T,
			args: S[],
		): T extends Promise<any>
			? T extends Promise<infer U> ? U[] : T[]
			: Promise<T[]>;
	}

	class Constants 
	{
		// tslint:disable-next-line:variable-name
		public static APIErrors: {
			UNKNOWN_ACCOUNT: 10001;
			UNKNOWN_APPLICATION: 10002;
			UNKNOWN_CHANNEL: 10003;
			UNKNOWN_GUILD: 10004;
			UNKNOWN_INTEGRATION: 10005;
			UNKNOWN_INVITE: 10006;
			UNKNOWN_MEMBER: 10007;
			UNKNOWN_MESSAGE: 10008;
			UNKNOWN_OVERWRITE: 10009;
			UNKNOWN_PROVIDER: 10010;
			UNKNOWN_ROLE: 10011;
			UNKNOWN_TOKEN: 10012;
			UNKNOWN_USER: 10013;
			UNKNOWN_EMOJI: 10014;
			UNKNOWN_WEBHOOK: 10015;
			BOT_PROHIBITED_ENDPOINT: 20001;
			BOT_ONLY_ENDPOINT: 20002;
			MAXIMUM_GUILDS: 30001;
			MAXIMUM_FRIENDS: 30002;
			MAXIMUM_PINS: 30003;
			MAXIMUM_ROLES: 30005;
			MAXIMUM_REACTIONS: 30010;
			UNAUTHORIZED: 40001;
			MISSING_ACCESS: 50001;
			INVALID_ACCOUNT_TYPE: 50002;
			CANNOT_EXECUTE_ON_DM: 50003;
			EMBED_DISABLED: 50004;
			CANNOT_EDIT_MESSAGE_BY_OTHER: 50005;
			CANNOT_SEND_EMPTY_MESSAGE: 50006;
			CANNOT_MESSAGE_USER: 50007;
			CANNOT_SEND_MESSAGES_IN_VOICE_CHANNEL: 50008;
			CHANNEL_VERIFICATION_LEVEL_TOO_HIGH: 50009;
			OAUTH2_APPLICATION_BOT_ABSENT: 50010;
			MAXIMUM_OAUTH2_APPLICATIONS: 50011;
			INVALID_OAUTH_STATE: 50012;
			MISSING_PERMISSIONS: 50013;
			INVALID_AUTHENTICATION_TOKEN: 50014;
			NOTE_TOO_LONG: 50015;
			INVALID_BULK_DELETE_QUANTITY: 50016;
			CANNOT_PIN_MESSAGE_IN_OTHER_CHANNEL: 50019;
			INVALID_OR_TAKEN_INVITE_CODE: 50020;
			CANNOT_EXECUTE_ON_SYSTEM_MESSAGE: 50021;
			BULK_DELETE_MESSAGE_TOO_OLD: 50034;
			INVITE_ACCEPTED_TO_GUILD_NOT_CONTAINING_BOT: 50036;
			REACTION_BLOCKED: 90001;
		};
	}
}
