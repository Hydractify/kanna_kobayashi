const { Collection } = require('discord.js');

const Command = require('../../structures/Command');
const RichEmbed = require('../../structures/RichEmbed');
const { titleCase } = require('../../util/Util');

class HelpCommand extends Command {
	constructor(handler) {
		super(handler, {
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

	async run(message, args) {
		if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
			return message.channel.send(`${message.author}! I do not have the permission to send **Embeds** (Embed Links Permission)! <:KannaWtf:320406412133924864>`);
		}

		if (!message.channel.permissionsFor(message.guild.me).has('ADD_REACTIONS')) {
			return message.channel.send(`${message.author}! I do not have the permission to **Add Reactions** (Add Reactions Permission)! <:KannaWtf:320406412133924864>`);
		}

		if (!message.channel.permissionsFor(message.guild.me).has('MANAGE_MESSAGES')) {
			return message.channel.send(`${message.author}! I do not have the permission to **Delete Messages** (Manage Messages Permission)! <:KannaWtf:320406412133924864>`);
		}

		if (!args[0]) {
			if (!message.author.model) await message.author.fetchModel();
			const [embeds, categoryCount] = this.mapCategories(message);

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
						helpMessage.edit({ embed: selectEmbed(true) });
						reaction.remove(message.author);
					}
					if (reaction.emoji.name === '⬅') {
						helpMessage.edit({ embed: selectEmbed(false) });
						reaction.remove(message.author);
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

		return this.findCommand(message, args);
	}

	mapCategories(message) {
		// Map all commands to their appropiate categories
		const categories = new Collection();
		for (const command of this.handler.commands.values()) {
			let category = categories.get(command.category);
			if (!category) category = [command];
			else category.push(command);
			categories.set(command.category, category);
		}


		// Make embeds out of them
		const embeds = [];
		for (const [category, commands] of categories) {
			const embed = RichEmbed.common(message)
				.setThumbnail(message.guild.iconURL)
				.setURL('http://kannathebot.me/guild')
				.setAuthor(`${this.client.user.username}'s ${titleCase(category)} Commands`)
				.setDescription('\u200b')
				.setColor(this.client.color(message.author.model));

			for (const command of commands) {
				embed.addField(`kanna ${command.name}`, command.usage);
			}

			embeds.push(embed);
		}

		return [embeds, categories.size];
	}

	findCommand(message, [commandName]) {
		const command = this.handler.commands.get(commandName)
			|| this.handler.commands.get(this.handler.aliases.get(commandName));

		if (command) {
			return message.channel.send(RichEmbed.common(message)
				.setAuthor(`${titleCase(command.name)}'s Info`, this.client.user.displayAvatarURL)
				.setDescription('\u200b')
				.setURL('http://kannathebot.me/guild')
				.setColor(this.client.color(message.author.model))
				.setThumbnail(message.guild.iconURL)
				.addField('Aliases', `kanna ${command.aliases.join('\nkanna ')}`)
				.addField('Usage', `kanna ${command.usage}`)
				.addField('Example(s)', `kanna ${command.examples.join('\nkanna ')}`)
				.addField('Description', command.description)
				.addField('Permissions Level Required', command.permLevel)
				.addField('Enabled', command.enabled ? 'Yes' : 'No')
			);
		}

		return message.channel
			.send(`Could not find any command matching **${commandName}** <:KannaAyy:315270615844126720>`);
	}
}

module.exports = HelpCommand;
