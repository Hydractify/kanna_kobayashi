import { GuildEmoji, Message } from 'discord.js';
import * as moment from 'moment';

import { Client } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { EmojiMatchType } from '../../types/EmojiMatchType';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

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

	public async parseArgs(message: Message, [emojiName]: string[]): Promise<string | [GuildEmoji]> {
		if (!emojiName) return 'you have to give me something to search for!';

		const results: [EmojiMatchType, GuildEmoji][] = await this.client.shard.broadcastEval(
			// tslint:disable-next-line:no-shadowed-variable
			(client: Client, [name, shardId, emojiName]: [string, number, string]) =>
				(client.commandHandler.resolveCommand(name) as EmojiInfoCommand).searchEmoji(emojiName),
			[this.name, this.client.shard.id, emojiName],
		);

		let emoji: GuildEmoji;
		for (const result of results) {
			if (!result) continue;
			let type: EmojiMatchType;
			[type, emoji] = result;
			if (type === EmojiMatchType.EXACT) break;
		}

		// Guild is not on this shard
		if (emoji) return [new GuildEmoji(this.client, emoji, undefined)];

		const match: RegExpMatchArray = emojiName.match(/<:([A-z\d_]{2,32}):(\d{17,19})>/);
		if (!match) return 'I could not find a custom emoji by that name or id!';

		// Guild is not on any shard, but exists
		return [new GuildEmoji(this.client, { name: match[1], id: match[2] }, undefined)];
	}

	public async run(
		message: Message,
		[emoji]: [GuildEmoji],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
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

	public searchEmoji(emojiName: string): [EmojiMatchType, GuildEmoji] {
		if (this.client.emojis.has(emojiName)) return [EmojiMatchType.EXACT, this.client.emojis.get(emojiName)];
		const lowerCasedName: string = emojiName.toLowerCase();
		let inExactMatch: GuildEmoji;
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name === emojiName) return [EmojiMatchType.EXACT, emoji];
			if (emoji.name.toLowerCase() === lowerCasedName) inExactMatch = emoji;
		}

		if (inExactMatch) return [EmojiMatchType.INEXCACT, inExactMatch];

		return [undefined, undefined];
	}
}

export { EmojiInfoCommand as Command };
