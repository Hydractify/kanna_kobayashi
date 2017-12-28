import { Emoji } from 'discord.js';

class EmojiExtension {
	public toJSON(this: Emoji): object {
		return {
			id: this.id,
			managed: this.managed,
			name: this.name,
			require_colons: this.requiresColons,
			roles: (this as any)._roles,
		};
	}
}

export { EmojiExtension as Extension };
export { Emoji as Target };
