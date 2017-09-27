const { Collection } = require('discord.js');
const { readdir } = require('fs');
const humanizeDuration = require('humanize-duration');
const { join } = require('path');
const { promisify } = require('util');

const CommandLog = require('../models/CommandLog');
const Guild = require('../models/Guild');
const User = require('../models/User');
const Logger = require('./Logger');

const readdirAsync = promisify(readdir);

/**
 * Represents the CommandHandler
 */
class CommandHandler {
	/**
	 * Instantiate a new CommandHandler
	 * @param {Client} client Instantiating client
	 */
	constructor(client) {
		/**
		 * Client that instantiated this CommandHandler
		 * @type {Client}
		 */
		this.client = client;
		/**
		 * Reference to the Logger instance
		 * @type {Logger}
		 */
		this.logger = Logger.instance;

		/**
		 * All loaded commands
		 * @type {Collection<string, Command>}
		 */
		this.commands = new Collection();
		/**
		 * All loaded command aliases
		 * @type {Collection<string, string>}
		 */
		this.aliases = new Collection();
	}

	/**
	 * Handles incoming messages
	 * @param {Message} message Incoming message
	 */
	async handle(message) {
		if (message.channel.type !== 'text'
			|| message.author.bot) return;

		const authorModel = message.author.model = await User.findCreateFind({ where: { id: message.author.id } });
		if (authorModel.type === 'BLACKLISTED') return;

		const ownerModel
			= message.author.id === message.guild.ownerID
				? authorModel
				: message.guild.owner.user.model = await User.findCreateFind({ where: { id: message.guild.ownerID } });

		if (ownerModel.type === 'BLACKLISTED') return;

		const guildModel = message.guild.model = await Guild.findCreateFind({ where: { id: message.guild.id } });

		if (ownerModel.type !== 'WHITELISTED'
			&& message.guild.isBotfarm) return;

		const prefixes = [`<@!?${this.client.user.id}> `, 'kanna ', 'k!']
			.concat(guildModel.prefixes.map(prefix =>
				prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')));
		const regex = new RegExp(`^(${prefixes.join('|')})`, 'i');

		const match = regex.exec(message.content);
		if (!match) return;

		const [commandName, ...args] = message.content.slice(match[1].length);

		const command = this.commands.get(commandName.toLowerCase())
			|| this.commands.get(this.aliases.get(commandName.toLowerCase()));

		if (!command) return;

		// After checking for a valid command now :^)
		if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
			await message.author.send('I do not have the send messages permission for the channel of your command!')
				.catch(() => null);
			return;
		}

		// Message#member is not a getter, so just reassign if not cached
		if (!message.member) message.member = await message.guild.fetchMember(message.author.id);

		const { permLevel } = message.member;

		if (command.permLevel > permLevel) {
			await message.channel
				.send(`${message.author}, you don't have the required permission level to use **${command.name}**!`);
			return;
		}

		// Check whether the command is enabled before editing log / granting coins / exp
		if (!command.enabled) {
			message.channel.send(`${message.author}, **${command.name}** is currently disabled!`);
			return;
		}

		const commandLog = CommandLog.findCreateFind({
			where: {
				userId: message.author.id,
				command: command.toLowerCase()
			}
		});
		const timeLeft = commandLog.lastUsed.getTime() + command.cooldown - Date.now();

		if (!['DEV', 'TRUSTED'].includes(authorModel.type)
			&& timeLeft > 0) {
			const timeLeftString = humanizeDuration(timeLeft, {
				round: true,
				largest: 2,
				conjuntion: ' and ',
				serialComma: false
			});
			await message.channel
				.send(`${message.author}, **${command.name}** is on cooldown! Please wait **${timeLeftString}**`);
			return;
		}

		commandLog.lastUsed = new Date();
		await commandLog.save();

		const { level } = authorModel;
		authorModel.exp += command.exp;
		authorModel.exp += command.coins;

		if (authorModel.level > level && guildModel.notifications.levelUp) {
			message.channel.send(`Woot! ${message.author}, you are now level ${authorModel.level}!`);
		}

		try {
			await command.run(message, args);
		} catch (error) {

		}
	}

	/**
	 * Loads command from the specified directory
	 * @param {string} path Path were to load from
	 */
	async loadCommandsIn(path) {
		const folders = await readdirAsync(path);
		for (const folder of folders) {
			// Load all categories at once instead of one by one
			readdirAsync(join(path, folder)).then(files => {
				for (const file of files) {
					const CommandClass = require(join(path, folder, file));
					const command = new CommandClass(this.client);

					command.category = folder;

					this.commands.set(command.name, command);
					for (const alias of command.aliases) {
						this.aliases.set(alias, command.name);
					}
				}

				this.logger.load(`[COMMANDS] Loaded ${files.length} ${folder} commands.`);
			});
		}
	}
}

module.exports = CommandHandler;
