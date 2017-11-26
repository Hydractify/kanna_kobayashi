import { Guild } from 'discord.js';

import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { UserTypes } from '../types/UserTypes';

class GuildExtension {
	public async fetchModel(this: Guild): Promise<GuildModel> {
		if (this.model) return this.model;

		[this.model] = await GuildModel.findCreateFind<GuildModel>({ where: { id: this.id } });

		return this.model;
	}

	public isBotFarm(this: Guild, ownerModel?: UserModel): boolean {
		if (ownerModel && ownerModel.type === UserTypes.WHITELISTED) return false;
		if (this.memberCount <= 30) return false;

		const halfMemberCount: number = this.memberCount / 2;
		let botCount: number = 0;
		for (const { user: { bot } } of this.members.values()) {
			if (!bot) continue;
			if (++botCount > halfMemberCount) return true;
			if (botCount > 100) return true;
		}

		return false;
	}
}

export { GuildExtension as Extension };
export { Guild as Target };
