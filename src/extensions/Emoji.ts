import { Emoji } from 'discord.js';

class EmojiExtension {
	public toJSON(this: Emoji): object {
		return {
			id: this.id,
			name: this.name,
			require_colons: this.requiresColons,
			managed: this.managed,
			// tslint:disable-next-line:no-any
			roles: (this as any)._roles,
		};
	}
}

export { EmojiExtension as Extension };
export { Emoji as Target };
