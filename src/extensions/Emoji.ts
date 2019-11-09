import { Emoji, SnowflakeUtil } from 'discord.js';

class EmojiExtension
{
	public get createdTimestamp(this: Emoji): number | null
	{
		if (!this.id) return null;

		return SnowflakeUtil.deconstruct(this.id).timestamp;
	}

	public get createdAt(this: Emoji): Date | null
	{
		if (!this.id) return null;

		return new Date(this.createdTimestamp);
	}
}

export { EmojiExtension as Extension };
export { Emoji as Target };
