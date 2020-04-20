import { Structures } from 'discord.js';

import { Guild as GuildModel } from '../models/Guild';


const GuildExtensionClass = Structures.extend('Guild', Guild =>
	class GuildExtension extends Guild
	{
		public model!: GuildModel;

		public async fetchModel(): Promise<GuildModel>
		{
			if (this.model) return this.model;

			[this.model] = await GuildModel.findCreateFind<GuildModel>({ where: { id: this.id } });

			return this.model;
		}
	}
);

export { GuildExtensionClass as Guild };
