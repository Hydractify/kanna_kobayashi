import { Emoji, Message } from 'discord.js';
import * as moment from 'moment';

import { Client } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { EmojiMatchType } from '../../types/EmojiMatchType';
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

		const results: [EmojiMatchType | undefined, Emoji | undefined][] = await this.client.shard.broadcastEval(
			// tslint:disable-next-line:no-shadowed-variable
			(client: Client, [name, emojiName]: string[]): [EmojiMatchType | undefined, Emoji | undefined] =>
				(client.commandHandler.resolveCommand(name) as EmojiInfoCommand).searchEmoji(emojiName),
			[this.name, emojiName],
		);

		let emoji: Emoji | undefined;
		for (const result of results) {
			if (!result) continue;
			let type: EmojiMatchType | undefined;
			[type, emoji] = result;
			if (type === EmojiMatchType.EXACT) break;
		}

		// Guild is not on this shard
		if (emoji) return [new Emoji(this.client, emoji)];

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

	public searchEmoji(emojiName: string): [EmojiMatchType | undefined, Emoji | undefined] {
		if (this.client.emojis.has(emojiName)) return [EmojiMatchType.EXACT, this.client.emojis.get(emojiName)];
		const lowerCasedName: string = emojiName.toLowerCase();
		let inExactMatch: Emoji | undefined;
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name === emojiName) return [EmojiMatchType.EXACT, emoji];
			if (emoji.name.toLowerCase() === lowerCasedName) inExactMatch = emoji;
		}

		if (inExactMatch) return [EmojiMatchType.INEXCACT, inExactMatch];

		return [undefined, undefined];
	}
}

export { EmojiInfoCommand as Command };
