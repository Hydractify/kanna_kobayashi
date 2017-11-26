// tslint:disable:typedef only-arrow-functions ban-types interface-name

import { readdir } from 'fs';
import { basename } from 'path';
import { promisify } from 'util';

const readdirAsync = promisify(readdir);

import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';

export async function extendAll(): Promise<void> {
	const files: string[] = await readdirAsync(__dirname);
	for (const file of files) {
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
