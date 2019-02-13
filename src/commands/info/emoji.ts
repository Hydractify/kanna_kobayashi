import { Emoji, Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { Emojis } from '../../types/Emojis';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class EmojiInfoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['einfo', 'ee', 'emoji'],
			clientPermissions: ['EMBED_LINKS'],
			description: 'Search for information about any custom emoji',
			examples: [
				'emoji KannaWave',
				'emoji 333771413842558976',
				// Displays as regular emoji
				`emoji ${Emojis.KannaGreetings}`,
			],
			usage: 'emoji <Emoji>',
		});
	}

	public async parseArgs(message: Message, [emojiName]: string[]): Promise<string | [Emoji]> {
		if (!emojiName) return 'you have to give me something to search for!';

		const emoji: Emoji | undefined = this.searchEmoji(emojiName);

		if (emoji) return [emoji];

		const match: RegExpMatchArray | null = emojiName.match(/<:([A-z\d_]{2,32}):(\d{17,19})>/);
		if (!match) return 'I could not find a custom emoji by that name or id!';

		// Guild is not on any shard, but exists
		return [new Emoji(this.client, { name: match[1], id: match[2] })];
	}

	public async run(
		message: Message,
		[emoji]: [Emoji],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const createdAtString: string = moment(emoji.createdTimestamp).format('MM/DD/YYYY (HH:mm)');
		const createdBeforeString: string = moment(emoji.createdTimestamp).fromNow();
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.addField('Name', emoji.name, true)
			.addField('ID', emoji.id, true)
			.addField('Created', createdAtString, true)
			.addField('Relative', createdBeforeString, true)
			.addField('Link', `[Link](${emoji.url})`, true)
			.setThumbnail(emoji.url);

		return message.channel.send(embed);
	}

	public searchEmoji(emojiName: string): Emoji | undefined {
		let emoji: Emoji | undefined = this.client.emojis.get(emojiName);
		if (emoji) return emoji;

		const lowerCasedName: string = emojiName.toLowerCase();
		for (const tmp of this.client.emojis.values()) {
			if (tmp.name === emojiName) return emoji;
			if (tmp.name.toLowerCase() === lowerCasedName) emoji = tmp;
		}

		return emoji;
	}
}

export { EmojiInfoCommand as Command };
