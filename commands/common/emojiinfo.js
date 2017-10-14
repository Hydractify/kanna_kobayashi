const { Emoji } = require('discord.js');
const moment = require('moment');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');

class EmojiInfoCommand extends Command {
	constructor(handler) {
		super(handler, {
			aliases: ['emoji'],
			clientPermissions: ['EMBED_LINKS'],
			coins: 0,
			description: 'Displays information about any custom emoji',
			examples: [
				'emojiinfo KannaWave',
				'emojiinfo 333771413842558976',
				// Displays as regular emoji
				'emojiinfo <:KannaWave:315264556177948673'
			],
			exp: 0,
			name: 'emojiinfo',
			usage: 'emojiinfo <emoji>'
		});
	}

	async run(message, [emojiName]) {
		let emoji = this.searchEmoji(emojiName);

		if (!emoji) {
			const results = await this.client.shard.broadcastEval(
				[
					`if (this.shard.id === ${this.client.shard.id}) null;`,
					`else this.commandHandler.commands.get('emojiinfo').searchEmoji('${emojiName}');`
				].join('\n')
			);

			for (const result of results) {
				if (!result) continue;
				let type;
				[type, emoji] = result;
				if (type === 'EXACT') break;
			}

			if (emoji) {
				// Guild is not on this shard
				emoji = new Emoji({ client: this.client }, emoji);
			} else {
				const match = emojiName.match(/<:([A-z\d_]{2,32}):(\d{17,19})>/);
				if (!match) return message.reply('I could not find any emoji by that name or id!');
				// Guild is not on any shard
				emoji = new Emoji({ client: this.client }, { name: match[1], id: match[2] });
			}
		} else {
			[, emoji] = emoji;
		}

		const createdAtString = moment(emoji.createdTimestamp).format('MM/DD/YYYY (HH:mm)');
		const createdBeforeString = moment(emoji.createdTimestamp).fromNow();
		const embed = RichEmbed.common(message)
			.addField('Name', emoji.name, true)
			.addField('ID', emoji.id, true)
			.addField('Created', createdAtString, true)
			.addField('Relative', createdBeforeString, true)
			.setThumbnail(emoji.url);

		return message.channel.send(embed);
	}

	searchEmoji(emojiName) {
		if (this.client.emojis.has(emojiName)) return ['EXACT', this.client.emojis.get(emojiName)];
		const lowerCasedName = emojiName.toLowerCase();
		let inExactMatch;
		for (const emoji of this.client.emojis.values()) {
			if (emoji.name === emojiName) return ['EXACT', emoji];
			if (emoji.name.toLowerCase() === lowerCasedName) inExactMatch = emoji;
		}

		if (inExactMatch) return ['INEXACT', inExactMatch];
		return null;
	}
}

module.exports = EmojiInfoCommand;
