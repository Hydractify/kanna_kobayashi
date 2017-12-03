import { Emoji, Message } from 'discord.js';
import * as moment from 'moment';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { MessageEmbed } from '../../structures/MessageEmbed';

class EmojiInfoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['einfo', 'ee', 'emoji'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Displays information about any custom emoji',
			examples: [
				'emoji KannaWave',
				'emoji 333771413842558976',
				// Displays as regular emoji
				'emojii <:KannaWave:315264556177948673',
			],
			exp: 0,
			name: 'emojiinfo',
			usage: 'emoji <Emoji>',
		});
	}

	public async parseArgs(message: Message, [emojiName]: string[]): Promise<string | [Emoji]> {
		if (!emojiName) return 'you have to give me something to search for!';

		let [, emoji]: [EmojiMatchType, Emoji] = this.searchEmoji(emojiName);

		if (emoji) {
			return [emoji];
		}

		const results: [EmojiMatchType, Emoji][] = await this.client.shard.broadcastEval(
			[
				`if (this.shard.id === ${this.client.shard.id}) null;`,
				`else this.commandHandler.commands.get('emojiinfo').searchEmoji('${emojiName}');`,
			].join('\n'),
		);

		for (const result of results) {
			if (!result) continue;
			let type: EmojiMatchType;
			[type, emoji] = result;
			if (type === EmojiMatchType.EXACT) break;
		}

		if (emoji) {
			// Guild is not on this shard
			return [new Emoji(this.client, emoji, undefined)];
		}

		const match: RegExpMatchArray = emojiName.match(/<:([A-z\d_]{2,32}):(\d{17,19})>/);
		if (!match) return 'I could not find any emoji by that name or id!';

		// Guild is not on any shard, but exists
		return [new Emoji(this.client, { name: match[1], id: match[2] }, undefined)];
	}

	public async run(message: Message, [emoji]: [Emoji], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const createdAtString: string = moment(emoji.createdTimestamp).format('MM/DD/YYYY (HH:mm)');
		const createdBeforeString: string = moment(emoji.createdTimestamp).fromNow();
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.addField('Name', emoji.name, true)
			.addField('ID', emoji.id, true)
			.addField('Created', createdAtString, true)
			.addField('Relative', createdBeforeString, true)
			.setThumbnail(emoji.url);

		return message.channel.send(embed);
	}

	public searchEmoji(emojiName: string): [EmojiMatchType, Emoji] {
		if (this.client.emojis.has(emojiName)) return [EmojiMatchType.EXACT, this.client.emojis.get(emojiName)];
		const lowerCasedName: string = emojiName.toLowerCase();
		let inExactMatch: Emoji;
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name === emojiName) return [EmojiMatchType.EXACT, emoji];
			if (emoji.name.toLowerCase() === lowerCasedName) inExactMatch = emoji;
		}

		if (inExactMatch) return [EmojiMatchType.INEXCACT, inExactMatch];

		return undefined;
	}
}

export { EmojiInfoCommand as Command };
