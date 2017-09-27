const { Client: DJSClient, RichEmbed } = require('discord.js');
const { join } = require('path');
const Raven = require('raven');
const { post } = require('snekfetch');

const { dbots, fakedbots } = require('../data');
const User = require('../models/User');
const Logger = require('./Logger');
const CommandHandler = require('./CommandHandler');

/**
 * Represents the Client used to interace with discord; an extended discord.js Client
 */
class Client extends DJSClient {
	/**
	 * Instantiate a new Client
	 * @param {ClientOptions} options Options for the discord.js Client
	 */
	constructor(options) {
		super(options);

		/**
		 * Reference to the Logger instance
		 * @type {Logger}
		 */
		this.logger = Logger.instance;

		/**
		 * Command handler of the client
		 * @type {CommandHandler}
		 */
		this.commandHandler = new CommandHandler(this);
		this.commandHandler.loadCommandsIn(join(__dirname, '..', 'commands'));

		this.on('disconnect', this._onDisconnect);
		this.on('error', this._onError);
		this.once('ready', this._onceReady);
		this.on('reconnecting', this._onReconnecting);
		this.on('resume', this._onResume);
		this.on('warn', this._onWarn);

		this.on('message', this.commandHandler.handle.bind(this.commandHandler));

		this.on('guildCreate', this._onGuild.bind(this, false));
		this.on('guildDelete', this._onGuild.bind(this, true));
	}

	/**
	 * Get a color, accepts a user model as fist parameter to account for devs / trusted
	 * @param {User} [user] The user model (not discord.js User)
	 * @returns {number} The resolved color
	 */
	color(user) {
		if (user) {
			if (user.type === 'DEV') return 0x00000f;
			if (user.type === 'TRUSTED') return 0xffffff;
		}

		/* eslint-disable id-length */
		// Copy from https://github.com/Qix-/color-convert/blob/4cb0bcc87e1f0e1b9e2f63447e8a5a8cc5709138/conversions.js#L314
		const h = ((Math.random() * 150) + 250) / 60;
		const s = ((Math.random() * 50) + 50) / 100;
		let v = ((Math.random() * 50) + 50) / 100;
		const hi = Math.floor(h) % 6;

		const f = h - Math.floor(h);

		const p = 255 * v * (1 - s);
		const q = 255 * v * (1 - (s * f));
		const t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;
		/* eslint-enable id-length */

		switch (hi) {
			case 0:
				return this.resolver.resolveColor([v, t, p]);
			case 1:
				return this.resolver.resolveColor([q, v, p]);
			case 2:
				return this.resolver.resolveColor([p, v, t]);
			case 3:
				return this.resolver.resolveColor([p, q, v]);
			case 4:
				return this.resolver.resolveColor([t, p, v]);
			case 5:
				return this.resolver.resolveColor([v, p, q]);
			default:
				// You're welcome, eslint
				throw new Error('Arithmetic failure with HSV conversion, technically impossible.');
		}
	}

	/**
	 * Run when the client's WebSocket disconnects.
	 * @param {CloseEvent} event The close event emitted by the closing WebSocket
	 * @private
	 */
	_onDisconnect({ code, reason }) {
		this.logger.bot(`[DISCONNECT]: Bot disconnected.\nCode: ${code}\nReason: ${reason}`);
	}

	/**
	 * Run whenever the client encounters an error.
	 * @param {Error} error The encountered error
	 * @private
	 */
	_onError(error) {
		this.logger.error('[CLIENT]: Encountered an error:', error);
	}

	/**
	 * Run once when the client is ready.
	 * @private
	 */
	_onceReady() {
		this.logger.bot(`[READY]: Logged in as ${this.user.tag} (${this.user.id})`);
		if (this.shard.id === 0) {
			this.setInterval(this._updateBotLists.bind(this), 30 * 60 * 1000);
		}
	}

	/**
	 * Run whenever the client's WebSocket is reconnecting.
	 * @private
	 */
	_onReconnecting() {
		this.logger.bot('[RECONNECTING]: Client reconnecting.');
	}

	/**
	 * Run whenever the client's WebSocket resumed.
	 * @param {number} replayed The number of replayed events
	 * @private
	 */
	_onResume(replayed) {
		this.logger.bot(`[RESUMED]: Replayed ${replayed} events.`);
	}

	/**
	 * Run whenever the client emits a warning.
	 * @param {string} warning The emitted warning
	 * @private
	 */
	_onWarn(warning) {
		this.logger.bot('[WARN]:', warning);
	}

	/**
	 * Run whenever the client joins or leaves a guild
	 * @param {boolean} left Whether this is a guildDelete
	 * @param {Guild} guild The relevant guild
	 * @private
	 */
	async _onGuild(left, guild) {
		if (guild.memberCount !== guild.members.size) await guild.fetchMembers();

		const totalGuilds = await this.shard.fetchClientValues('guilds.size')
			.then(result => result.reduce((previous, current) => previous + current));
		const blacklisted = await User.findOne({ where: { id: guild.ownerID, type: 'BLACKLISTED' } })
			.then(user => user ? 'Yes' : 'No');
		const humanCount = guild.members.filter(member => !member.user.bot).size;

		const embed = new RichEmbed()
			.setThumbnail(guild.iconURL
			|| 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
			.setTitle(`I have ${left ? 'left' : 'joined'} a guild!`)
			.setDescription(`I am now on ${totalGuilds} guilds.`)
			.setColor(this.color())
			.addField('Name', guild.name, true)
			.addField('ID', guild.id, true)
			.addField('Owner', guild.owner.user.tag, true)
			.addField('Owner id', guild.ownerID, true)
			.addField('Blacklisted', blacklisted, true)
			.addField('Total members', guild.memberCount, true)
			.addField('Humans', humanCount, true)
			.addField('Bots', guild.memberCount - humanCount, true);

		// Avoid sharding issue when the channel is on a different shard. Still has rate limiting and retry on 5xx
		// Note: This is somewhat safe to use because there will be no releases until v12, which is breaking anyway
		this.rest.methods.sendMessage({ id: '303180857030606849' }, undefined, { embed });
	}

	/**
	 * Updates the bot lists entries regarding the guild count
	 * @private
	 */
	async _updateBotLists() {
		const body = {
			// eslint-disable-next-line camelcase
			server_count: await this.shard.fetchClientValues('guilds.size')
				.then(res => res.reduce((prev, val) => prev + val))
		};

		this.logger.bot('[BotLists]: Updating guild count at bot lists.');

		post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`)
			.set('Authorization', dbots)
			.send(body)
			.then(() => this.logger.bot('[BotLists]: Updated bots.discord\'s guild count.'))
			.catch(error => {
				Raven.captureException(error);
				this.logger.error('[BotLists]: Updating bots.discord\'s guild coint failed:', error);
			});

		post(`https://discordbots.org/api/bots/${this.user.id}/stats`)
			.set('Authorization', fakedbots)
			.send(body)
			.then(() => this.logger.bot('[BotLists]: Updated discordbots\' guild count.'))
			.catch(error => {
				Raven.captureException(error);
				this.logger.error('[BotLists]: Updating discordbots\'s guild coint failed:', error);
			});
	}
}

module.exports = Client;
