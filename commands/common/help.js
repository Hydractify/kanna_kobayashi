const { Collection } = require('discord.js');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class HelpCommand extends Command {
	constructor(handler) {
		super(handler, {
			clientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
			aliases: ['halp', 'commands'],
			coins: 0,
			exp: 0,
			cooldown: 10000,
			description: 'See all the commands (or a specifc one) Kanna has!\n'
				+ '_PS: Use the arrow reactions to scroll through categories_',
			name: 'help',
			permLevel: 0,
			examples: ['help ping', 'help'],
			usage: 'help [Command]'
		});
	}

	async run(message, [name], { authorModel }) {
		if (name) name = name.toLowerCase();
		if (!name || name === 'all') {
			const [embeds, categoryCount] = this.mapCategories(message, authorModel);

			const helpMessage = await message.channel.send({ embed: embeds[0] });
			const emojis = ['⬅', '➡', '❎'];
			for (const emoji of emojis) {
				// eslint-disable-next-line no-await-in-loop
				await helpMessage.react(emoji);
			}

			let page = 0;
			const selectEmbed = increment => {
				if (embeds[increment ? ++page : --page]) return embeds[page];

				page = page <= 0
					? categoryCount - 1
					: 0;

				return embeds[page];
			};

			const filter = (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id;

			const reactionCollector = helpMessage.createReactionCollector(filter, { time: 300000 })
				.on('collect', reaction => {
					if (reaction.emoji.name === '➡') {
						reaction.remove(message.author).catch(() => null);
						helpMessage.edit({ embed: selectEmbed(true) }).catch(error => {
							reactionCollector.stop();
							throw error;
						});
					}
					if (reaction.emoji.name === '⬅') {
						reaction.remove(message.author).catch(() => null);
						helpMessage.edit({ embed: selectEmbed(false) }).catch(error => {
							reactionCollector.stop();
							throw error;
						});
					}
					if (reaction.emoji.name === '❎') {
						reactionCollector.stop();
					}
				}).on('end', () => {
					message.delete().catch(() => null);
					helpMessage.delete().catch(() => null);
				});

			return undefined;
		}

		return this.findCategory(message, name, authorModel)
			|| this.findCommand(message, name, authorModel);
	}

	mapCategories(message, authorModel) {
		// Map all commands to their appropiate categories
		const categories = new Collection();
		for (const command of this.handler.commands.values()) {
			let category = categories.get(command.category);
			if (!category) category = [command];
			else category.push(command);
			categories.set(command.category, category);
		}

		// Cache permission level
		const permLevel = message.member.permLevel(authorModel);

		// Make embeds out of them
		const embeds = [];
		for (const [category, commands] of categories) {
			const embed = RichEmbed.common(message, authorModel)
				.setThumbnail(message.guild.iconURL)
				.setURL('http://kannathebot.me/guild')
				.setAuthor(`${this.client.user.username}'s ${titleCase(category)} Commands`)
				.setDescription('\u200b');

			for (const command of commands) {
				if (command.permLevel > permLevel) continue;
				embed.addField(`kanna ${command.name}`, `<prefix> ${command.usage}`, true);
			}

			if (embed.fields.length) embeds.push(embed);
		}

		return [embeds, embeds.length];
	}

	findCategory(message, categoryName, authorModel) {
		let embed;
		for (const command of this.handler.commands.values()) {
			if (command.category.toLowerCase() === categoryName) {
				// Only generate embed if category name is valid, pointless optimizing tbh
				if (!embed) {
					embed = RichEmbed.common(message, authorModel)
						.setThumbnail(message.guild.iconURL)
						.setURL('http://kannathebot.me/guild')
						.setAuthor(`${this.client.user.username}'s ${titleCase(categoryName)} Commands`)
						.setDescription('\u200b');
				}

				embed.addField(`kanna ${command.name}`, command.usage, true);
			}
		}

		return embed
			? message.channel.send(embed)
			: null;
	}

	findCommand(message, commandName, authorModel) {
		const command = this.handler.commands.get(commandName)
			|| this.handler.commands.get(this.handler.aliases.get(commandName));

		if (command) {
			return message.channel.send(RichEmbed.common(message, authorModel)
				.setAuthor(`${titleCase(command.name)}'s Info`, this.client.user.displayAvatarURL)
				.setDescription('\u200b')
				.setURL('http://kannathebot.me/guild')
				.setThumbnail(message.guild.iconURL)
				.addField('Aliases', `kanna ${command.aliases.join('\nkanna ')}`)
				.addField('Usage', `kanna ${command.usage}`)
				.addField('Example(s)', `kanna ${command.examples.join('\nkanna ')}`)
				.addField('Description', command.description)
				.addField('Permissions Level Required', command.permLevel)
				.addField('Enabled', command.enabled ? 'Yes' : 'No')
			);
		}

		return message
			.reply(`I could not find a command matching **${commandName}** <:KannaAyy:315270615844126720>`);
	}
}

module.exports = HelpCommand;
