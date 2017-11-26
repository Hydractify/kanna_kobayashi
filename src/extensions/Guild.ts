import { Guild } from 'discord.js';

import { Guild as GuildModel } from '../models/Guild';

class GuildExtension {
	public get isBotFarm(this: Guild): boolean {
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

	public async fetchModel(this: Guild): Promise<GuildModel> {
		if (this.model) return this.model;

		[this.model] = await GuildModel.findCreateFind<GuildModel>({ where: { id: this.id } });

		return this.model;
	}
}

export { GuildExtension as Extension };
export { Guild as Target };
