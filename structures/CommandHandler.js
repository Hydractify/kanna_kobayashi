const { Collection } = require('discord.js');
const { readdir } = require('fs');
const humanizeDuration = require('humanize-duration');
const { join } = require('path');
const Raven = require('raven');
const { promisify } = require('util');

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
		if (message.channel.type !== 'text' || message.author.bot) return;

		let guildModel = await this._fetchModel(message.guild, Guild);
		const prefixes = [`<@!?${this.client.user.id}> `, 'kanna ', 'k!']
			.concat(guildModel.prefixes);
		const match = new RegExp(`^(${prefixes.join('|')})`, 'i').exec(message.content);
		if (!match) return;

		let authorModel = await this._fetchModel(message.author, Guild);
		if (authorModel.type === 'BLACKLISTED') return;

		if (!message.guild.owner) await message.guild.fetchMember(message.guild.ownerID);
		let ownerModel = await this._fetchModel(message.guild.owner.user, User);
		if (ownerModel.type === 'BLACKLISTED' || (ownerModel.type !== 'WHITELISTED' && message.guild.isBotfarm)) return;

		const [commandName, ...args] = message.content.slice(match[1].length).split(' ');
		const command = this.commands.get(commandName.toLowerCase())
			|| this.commands.get(this.aliases.get(commandName.toLowerCase()));
		if (!command) return;

		// After checking for a valid command now :^)
		if (!message.channel.permissionsFor(message.guild.me).has('SEND_MESSAGES')) {
			message.author.send('I do not have the send messages permission for the channel of your command!')
				.catch(() => null);
			return;
		}

		// Message#member is not a getter, so just reassign if not cached
		if (!message.member) message.member = await message.guild.fetchMember(message.author.id);

		if (command.permLevel > message.member.permLevel) {
			message.channel
				.send(`${message.author}, you don't have the required permission level to use **${command.name}**!`);
			return;
		}

		// Check whether the command is enabled before editing log / granting coins / exp
		if (!command.enabled) {
			message.channel.send(`${message.author}, **${command.name}** is currently disabled!`);
			return;
		}

		const [commandLog] = await authorModel.getCommandLogs({
			order: [['run', 'DESC']],
			limit: 1
		});
		const timeLeft = commandLog
			? commandLog.run.getTime() + command.cooldown - Date.now()
			: 0;
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

		await authorModel.createCommandLog({ userId: message.author.id, commandName });

		try {
			await command.run(message, args);
		} catch (error) {
			Raven.captureException(error);
			this.logger.sentry('Sent an error to sentry:', error);
			message.channel.send(
				[
					'**An errror occured! Please paste this to the official guild!**'
					+ ' <:ayy:315270615844126720> http://kannathebot.me/guild',
					'',
					'',
					`\\\`${command.name}\\\``,
					'\\`\\`\\`',
					error.stack,
					'\\`\\`\\`'
				]
			);
		}

		const { level } = authorModel;
		authorModel.exp += command.exp;
		authorModel.exp += command.coins;
		await authorModel.save();

		if (authorModel.level > level && guildModel.notifications.levelUp) {
			message.channel.send(`Woot! ${message.author}, you are now level ${authorModel.level}!`);
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
					const command = new CommandClass(this);

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

	/**
	 * Resolver should probably be somwhere else, attaching one to the
	 * client is not really possible since discord.js already has one.
	 */

	/**
	 * Resolves the provided input to a guild member
	 * @param {Guild} guild The guild the member is part of
	 * @param {string} input The string to resolve the member from
	 * @returns {Promise<?GuildMember>}
	 */
	async resolveMember(guild, input) {
		if (!input) return null;

		// Mention or id
		let match = /^<@!?(\d{17,19})>$|^(\d{17,19})$/.exec(input);
		if (match) {
			return guild.members.get(match[1] || match[2])
				|| guild.fetchMember(match[1] || match[2]).catch(() => null);
		}

		input = input.toLowerCase();
		let displayMatch = null;
		for (const member of guild.members.values()) {
			if (
				// Check for the member's tag or username
				member.user.username.toLowerCase().includes(input)
				|| member.user.tag.toLowerCase() === input
			) {
				match = member;
				break;
			}
			// Check for the member's nickname (username has already been checked above)
			if (!displayMatch && member.nickname && member.nickname.toLowerCase().includes(input)) {
				displayMatch = member;
			}
		}

		if (match || displayMatch || guild.members.size >= guild.memberCount) {
			return match || displayMatch;
		}

		match = await this.resolveUser(input);
		if (match) guild.fetchMember(match).catch(() => null);

		return null;
	}

	/**
	 * Resolves a user based on user input
	 * @param {string} input User input
	 * @returns {Promise<?User>}
	 */
	resolveUser(input) {
		if (!input) return Promise.resolve(null);

		let match = /^<@!?(\d{17,19})>$|^(\d{17,19})$/.exec(input);
		if (match) {
			const user = this.client.users.get(match[1] || match[2]);
			if (user) return Promise.resolve(user);
			return this.client.fetchUser(match[1] || match[2]).catch(() => null);
		}
		for (const user of this.client.users.values()) {
			// Check for the user's tag or username
			if (user.tag.toLowerCase() === input || user.username.toLowerCase().includes(input)) {
				return Promise.resolve(user);
			}
		}

		return Promise.resolve(null);
	}

	/**
	 * Fetches a message by id from the provided channel
	 * @param {TextChannel} channel The channel to fetch from
	 * @param {string} id The provided input
	 * @returns {Promise<?Message>}
	 */
	resolveMessage(channel, id) {
		if (!id) return Promise.resolve(null);

		return id.match(/^\d{17,19}$/)
			? channel.fetchMessage(id).catch(() => null)
			: Promise.resolve(null);
	}

	/**
	 * Retrieves the appropriate model instance of the target from cache or from database if not cached.
	 * @param {any} target Target object
	 * @param {Model} source Source Model class
	 * @returns {Model} Model instance
	 */
	async _fetchModel(target, source) {
		if (target.model) return target.model;
		[target.model] = await source.findCreateFind({ where: { id: target.id } });

		return target.model;
	}
}

module.exports = CommandHandler;
