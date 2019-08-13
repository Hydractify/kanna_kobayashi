import { Collection, Guild, GuildMemberStore } from 'discord.js';

const { fetch } = GuildMemberStore.prototype;

class GuildMemberStoreExtension {
	public static get [Symbol.species](): typeof Collection {
		return Collection;
	}

	public async fetch(this: { guild: Guild } & GuildMemberStore, ...args: [any]): Promise<any> {
		try {
			return await fetch.apply(this, args);
		} catch (error) {
			if (error.code === 'GUILD_MEMBERS_TIMEOUT') {
				error.guild = this.guild.id;
				error.memberCount = this.guild.memberCount;
				error.members = this.size;
			}
			return Promise.reject(error);
		}
	}
}

export { GuildMemberStoreExtension as Extension };
export { GuildMemberStore as Target };
