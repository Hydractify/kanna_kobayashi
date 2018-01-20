import { GuildEmoji } from 'discord.js';

class GuildEmojiExtension {
	public toJSON(this: GuildEmoji): object {
		return {
			id: this.id,
			managed: this.managed,
			name: this.name,
			require_colons: this.requiresColons,
			roles: (this as any)._roles,
		};
	}
}

export { GuildEmojiExtension as Extension };
export { GuildEmoji as Target };
