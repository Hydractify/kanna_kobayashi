const { Collection, Util: { makePlainError } } = require('discord.js');
const { readdir } = require('fs');
const humanizeDuration = require('humanize-duration');
const { join } = require('path');
const Raven = require('raven');
const { promisify } = require('util');

const { titleCase } = require('../util/Util');
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

		let guildModel = await message.guild.fetchModel();
		const prefixes = [`<@!?${this.client.user.id}> `, 'kanna ', 'k!']
			.concat(guildModel.prefixes);
		const match = new RegExp(`^(${prefixes.join('|')})`, 'i').exec(message.content);
		if (!match) return;

		let authorModel = await message.author.fetchModel();
		if (authorModel.type === 'BLACKLISTED') return;

		if (!message.guild.owner) await message.guild.fetchMember(message.guild.ownerID);
		let ownerModel = await message.guild.owner.user.fetchModel();
		if (ownerModel.type === 'BLACKLISTED' || (ownerModel.type !== 'WHITELISTED' && message.guild.isBotfarm)) return;

		const [commandName, ...args] = message.content.slice(match[1].length).split(/ +/);
		const command = this.commands.get(commandName.toLowerCase())
			|| this.commands.get(this.aliases.get(commandName.toLowerCase()));
		if (!command) return;

		// Cache permissions to reuse them later
		const permissions = message.channel.permissionsFor(message.guild.me);
		if (!permissions.has('SEND_MESSAGES')) {
			message.author.send('I do not have the send messages permission for the channel of your command!')
				.catch(() => null);
			return;
		}
		const missing = permissions.missing(command.clientPermissions);
		if (missing.length) {
			const missingString = missing.map(permission =>
				titleCase(permission.replace(/_/g, ' '))
			).join(', ');
			message.channel.send(`${message.author}! I require the following permissions to execute **${commandName}** command: ${missingString}`)
				.catch(() => null);
			return;
		}


		// Message#member is not a getter, so just reassign if not cached
		if (!message.member) message.member = await message.guild.fetchMember(message.author.id);

		if (command.permLevel > message.member.permLevel) {
			message.channel
				.send(`${message.author}, you do not have the required permission level to use **${command.name}**!`);
			return;
		}

		// Check whether the command is enabled before editing log / granting coins / exp
		if (!command.enabled) {
			message.channel.send(`${message.author}, **${command.name}** is currently disabled!`);
			return;
		}

		const [commandLog] = await authorModel.getCommandLogs({
			limit: 1,
			order: [['run', 'DESC']],
			where: { commandName: command.name }
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
				.send([
					`${message.author}, **${command.name}** is on cooldown!`,
					`Please wait **${timeLeftString}** and try again!`
				].join(''));
			return;
		}

		await authorModel.createCommandLog({ userId: message.author.id, commandName: command.name });

		try {
			await command.run(message, args, commandName);
		} catch (error) {
			if (process.env.NODE_ENV !== 'dev') {
				Raven.captureException(error);
				this.logger.sentry('Sent an error to sentry:', error);
			} else {
				this.logger.error('CommandHandler#handle:', error);
			}

			message.channel.send(
				[
					'**An errror occured! Please paste this to the official guild support channel!**'
					+ ' <:KannaAyy:315270615844126720> http://kannathebot.me/guild',
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

		if (authorModel.level > level && guildModel.levelUpEnabled) {
			message.channel
				.send(`${message.author}, you advanced to level **${authorModel.level}**! <:KannaHugMe:299650645001240578>`);
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
					const location = join(path, folder, file);
					const CommandClass = require(location);
					const command = new CommandClass(this);

					command.location = location;
					command.category = folder;

					this.commands.set(command.name, command);
					for (const alias of command.aliases) {
						this.aliases.set(alias, command.name);
					}
				}

				this.logger.load(`[COMMANDS]: Loaded ${files.length} ${folder} commands.`);
			});
		}
	}

	reload(commandName) {
		const command = this.commands.get(commandName.toLowerCase())
			|| this.commands.get(this.aliases.get(commandName.toLowerCase()));

		if (!command) return [this.client.shard.id, false];

		try {
			command.reload();
		} catch (error) {
			return [this.client.shard.id, makePlainError(error)];
		}

		return [this.client.shard.id, true];
	}

	/**
	 * Resolver should probably be somwhere else, attaching one to the
	 * client is not really possible since discord.js already has one.
	 */

	/**
	 * Resolves the provided input to a guild member
	 * @param {Guild} guild The guild the member is part of
	 * @param {string} input The string to resolve the member from
	 * @param {boolean} [allowBots=true] Whether to allow bots to be resolved
	 * @returns {Promise<?GuildMember>}
	 */
	async resolveMember(guild, input, allowBots = true) {
		if (!input) return null;

		// Mention or id
		let match = /^<@!?(\d{17,19})>$|^(\d{17,19})$/.exec(input);
		if (match) {
			match = match[1] || match[2];

			let member = guild.members.get(match)
				|| await guild.fetchMember(match).catch(() => null);

			if (!member || (!allowBots && member.user.bot)) return null;
			return member;
		}

		input = input.toLowerCase();
		let displayMatch = null;
		for (const member of guild.members.values()) {
			if (!allowBots && member.user.bot) continue;

			// Check for an "exact" lowercased match
			if ((member.nickname && member.nickname.toLowerCase() === input)
				|| member.user.username.toLowerCase() === input
				|| member.user.tag.toLowerCase() === input
			) {
				match = member;
				break;
			}
			// Check for a partial match
			if (!displayMatch
				&& (member.user.username.toLowerCase().includes(input)
					|| (member.nickname && member.nickname.toLowerCase().includes(input))
				)
			) {
				displayMatch = member;
			}
		}

		if (match || displayMatch || guild.members.size >= guild.memberCount) {
			return match || displayMatch;
		}

		match = await this.resolveUser(input, allowBots);
		if (match) guild.fetchMember(match).catch(() => null);

		return null;
	}

	/**
	 * Resolves a user based on user input
	 * @param {string} input User input
	 * @param {boolean} [allowBots=true] Whether to allow bots being resolved
	 * @returns {Promise<?User>}
	 */
	async resolveUser(input, allowBots = true) {
		if (!input) return null;

		let match = /^<@!?(\d{17,19})>$|^(\d{17,19})$/.exec(input);
		if (match) {
			match = match[1] || match[2];

			let user = this.client.users.get(match)
				|| await this.client.fetchUser(match).catch(() => null);

			if (!user || (!allowBots && user.bot)) return null;
			return user;
		}
		for (const user of this.client.users.values()) {
			if (!allowBots && user.bot) continue;

			// Check for the user's tag or username
			if (user.username.toLowerCase().includes(input)
				|| user.tag.toLowerCase() === input
			) {
				return user;
			}
		}

		return null;
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
}

module.exports = CommandHandler;
