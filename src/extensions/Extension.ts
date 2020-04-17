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

		/* eslint-disable */
		const { Extension, Target }: {
			Extension: Function;
			Target: Function;
		} = require(`./${file}`);
		/* eslint-enable */

		Object.defineProperties(
			Target.prototype,
			Object.getOwnPropertyDescriptors(Extension.prototype),
		);
	}
}

declare module 'discord.js' {
	/* eslint-disable @typescript-eslint/interface-name-prefix */
	interface Guild {
		model: GuildModel;

		fetchModel(): Promise<GuildModel>;
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
	/* eslint-enable @typescript-eslint/interface-name-prefix */
}
