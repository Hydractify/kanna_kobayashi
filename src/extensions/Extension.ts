// tslint:disable:typedef only-arrow-functions ban-types interface-name

import { readdirSync } from 'fs';
import { basename, extname } from 'path';

import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';

export async function extendAll(): Promise<void> {
	// This _HAS_ to be blocking duo race conditions with discord.js
	const files: string[] = readdirSync(__dirname);
	for (const file of files) {
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
		readonly isBotFarm: boolean;
		model: GuildModel;

		fetchModel(): Promise<GuildModel>;
	}

	interface User {
		fetchModel(): Promise<UserModel>;
	}
}
