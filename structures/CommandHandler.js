const { Collection, Util: { makePlainError } } = require('discord.js');
const { readdir } = require('fs');
const humanizeDuration = require('humanize-duration');
const { join } = require('path');
const Raven = require('raven');
const { promisify } = require('util');

const { titleCase } = require('../util/Util');
const Logger = require('./Logger');
const { instance: { db: redis } } = require('./Redis');

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

		const guildModel = await message.guild.fetchModel();
		const prefixes = [`<@!?${this.client.user.id}> `, 'kanna ', 'k!']
			.concat(guildModel.prefixes);
		const match = new RegExp(`^(${prefixes.join('|')})`, 'i').exec(message.content);
		if (!match) return;

		const [authorModel, ownerModel] = await this.fetchModels(message);
		if (authorModel.type === 'BLACKLISTED') return;
		if (ownerModel.type === 'BLACKLISTED'
			|| (ownerModel.type !== 'WHITELISTED' && message.guild.isBotFarm(ownerModel))
		) return;

		const [command, commandName, args] = this.resolveCommand(message, match);
		if (!command) return;

		if (!await this.canCallCommand(message, authorModel, command)) return;

		await authorModel.createCommandLog({ userId: message.author.id, commandName: command.name });

		try {
			await command.run(message, args, commandName);
			await this.handleRewards(message, authorModel, guildModel, command);
		} catch (error) {
			if (process.env.NODE_ENV !== 'dev') {
				Raven.captureException(error);
				this.logger.sentry('Sent an error to sentry:', error);
			} else {
				this.logger.error('CommandHandler#handle:', error);
			}

			message.reply(
				[
					'**an errror occured! Please paste this to the official guild support channel!**'
					+ ' <:KannaAyy:315270615844126720> http://kannathebot.me/guild',
					'',
					'',
					`\\\`${command.name}\\\``,
					'\\`\\`\\`',
					error.stack,
					'\\`\\`\\`'
				].join('\n')
			);
		}
	}

	/**
	 * 
	 * @param {Message} message Incoming message
	 * @param {User} authorModel Model of the author of the message
	 * @param {Guild} guildModel Model of the guild
	 * @param {Object} command Called command
	 * @param {number} command.exp The amount of experience the user should get
	 * @param {number} command.coins The amount of coins the user should get
	 */
	async handleRewards(message, authorModel, { levelUpEnabled }, { exp, coins }) {
		if (!exp && !coins) return;

		const { level } = authorModel;
		const multi = redis.multi();
		const fields = {};

		if (exp) {
			multi.hincrby(`users::${message.author.id}`, 'exp', exp);
			// We read the exp a few lines below this again to check for a levelup
			authorModel.exp += exp;
			fields.exp = exp;
		}

		if (coins) {
			multi.hincrby(`users::${message.author.id}`, 'coins', coins);
			// Model will be discarded directly anyway, no need to add coins to it
			fields.coins = coins;
		}

		await Promise.all([
			multi.execAsync(),
			authorModel.increment(fields)
		]);

		if (authorModel.level > level && levelUpEnabled) {
			await message.reply(`you advanced to level **${authorModel.level}**! <:KannaHugMe:299650645001240578>`);
		}
	}

	/**
	 * Fetches authorModel, ownerModel and GuildMember of author.
	 * @param {Message} message Incoming message
	 * @returns {Promise<[User, User, ?GuildMember, ?GuildMember]>}
	 */
	fetchModels(message) {
		const promises = [
			message.author.fetchModel(),
			this.client.users.get(message.guild.ownerID).fetchModel()
		];

		if (!message.member) {
			promises.push(message.guild.fetchMember(message.author.id)
				// eslint-disable-next-line no-return-assign
				.then(member => message.member = member));
		}

		if (!message.guild.owner) promises.push(message.guild.fetchMember(message.guild.ownerID));

		return Promise.all(promises);
	}

	/**
	 * Resolves the called command from message and match array.
	 * @param {Message} message Incoming message
	 * @param {RegExpExecArray} match Match from prefix check
	 * @returns {Tuple<Command|string|string[]>|Tuple<boolean, undefined, undefined>}
	 */
	resolveCommand(message, match) {
		const [commandName, ...args] = message.content.slice(match[1].length).split(/ +/);
		const command = this.commands.get(commandName.toLowerCase())
			|| this.commands.get(this.aliases.get(commandName.toLowerCase()));
		if (!command) return [false, undefined, undefined];

		return [command, commandName.toLowerCase(), args];
	}

	/**
	 * Whether the command can be run by the caller.
	 * - Ensures that the bot and caller have correct permissions to execute the command.
	 * - That it's enabled.
	 * - That i's not on cooldown
	 * If not sends a message and returns false.
	 * @param {Message} message Incoming message
	 * @param {User} authorModel Model of the author of the message
	 * @param {Command} command Command that is to be executed
	 * @return {Promise<boolean>} Whether the command can be called
	 */
	async checkPermissions(message, authorModel, command) {
		// Cache permissions to reuse them later
		const permissions = message.channel.permissionsFor(message.guild.me);
		if (!permissions.has('SEND_MESSAGES')) {
			message.author.send('I do not have the send messages permission for the channel of your command!')
				.catch(() => null);

			return false;
		}

		const missing = permissions.missing(command.clientPermissions);
		if (missing.length) {
			const missingPermsString = missing.map(permission =>
				titleCase(permission.replace(/_/g, ' '))
			).join(', ');

			await message.reply(
				`I require the following permissions to execute the **${command.name}** command: **${missingPermsString}**`
			);

			return false;
		}

		if (command.permLevel > message.member.permLevel(authorModel)) {
			await message.reply(`you do not have the required permission level to use **${command.name}**!`);

			return false;
		}

		if (!command.enabled) {
			await message.reply(`**${command.name}** is currently disabled!`);

			return false;
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

			await message.reply([
				`**${command.name}** is on cooldown!`,
				`Please wait **${timeLeftString}** and try again!`
			].join('\n'));

			return false;
		}

		return true;
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

	/**
	 * Reloads a command by name or alias
	 * @param {string} commandName Name or alias of the command to reload
	 * @returns {Tuple<string, boolean | Error>} Shard ID and false for not found, true for success
	 * and error for error
	 */
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
			if ((member.nickname && member.nickname.toLowerCase() === input.toLowerCase())
				|| member.user.username.toLowerCase() === input.toLowerCase()
				|| member.user.tag.toLowerCase() === input.toLowerCase()
			) {
				match = member;
				break;
			}
			// Check for a partial match
			if (!displayMatch
				&& (member.user.username.toLowerCase().includes(input.toLowerCase())
					|| (member.nickname && member.nickname.toLowerCase().includes(input.toLowerCase()))
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
			if (user.tag.toLowerCase() === input.toLowerCase()
				|| user.username.toLowerCase().includes(input.toLowerCase())
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

	/**
	 * Resolves a role from a collection of roles by user input
	 * @param {Collection<string, Roles>} roles Collection of roles 
	 * @param {string} input Input to resolve from
	 * @param {boolean} [allowEveryone=true] Whether to allow the everyone role to be machted
	 * @returns {Role}
	 */
	resolveRole(roles, input, allowEveryone = true) {
		let match = /^<@&(\d{17,19})>$|^(\d{17,19})$/.exec(input);
		if (match) {
			match = match[1] || match[2];
			if (!allowEveryone && match === roles.first().guild.id) return null;
			return roles.get(match[1] || match[2]) || null;
		}

		input = input.toLowerCase();

		for (const role of roles.values()) {
			if (!allowEveryone && role.id === role.guild.id) continue;
			const roleName = role.name.toLowerCase();
			if (roleName === input) return role;
			if (!match && roleName.includes(input)) match = role;
		}

		return match;
	}
}

module.exports = CommandHandler;
