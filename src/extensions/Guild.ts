import { Guild } from 'discord.js';

import { Guild as GuildModel } from '../models/Guild';

class GuildExtension 
{
	public async fetchModel(this: Guild): Promise<GuildModel> 
	{
		if (this.model) return this.model;

		[this.model] = await GuildModel.findCreateFind<GuildModel>({ where: { id: this.id } });

		return this.model;
	}
}

export { GuildExtension as Extension };
export { Guild as Target };
