const { Client: DJSClient, RichEmbed } = require('discord.js');

const SpecialUsers = require('../models/SpecialUsers');
const Logger = require('./Logger');

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

		this.on('disconnect', this._onDisconnect);
		this.on('error', this._onError);
		this.on('ready', this._onReady);
		this.on('resume', this._onResume);

		this.on('guildCreate', this._onGuild.bind(this, false));
		this.on('guildDelete', this._onGuild.bind(this, true));
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
	 * Run when the client is ready.
	 * @private
	 */
	_onReady() {
		this.logger.bot(`[READY]: Logged in as ${this.user.tag} (${this.user.id})`);
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
	 * Run whenever the client joins or leaves a guild
	 * @param {boolean} left Whether this is a guildDelete
	 * @param {Guild} guild The relevant guild
	 * @private
	 */
	async _onGuild(left, guild) {
		if (guild.memberCount !== guild.members.size) await guild.fetchMembers();

		const totalGuilds = await this.shard.fetchClientValues('guilds.size')
			.then(result => result.reduce((previous, current) => previous + current));
		const blacklisted = await SpecialUsers.findOne({ where: { id: guild.ownerID, type: 'BLACKLISTED' } })
			.then(user => user ? 'Yes' : 'No');
		const humanCount = guild.members.filter(member => !member.user.bot).size;

		const embed = new RichEmbed()
			.setThumbnail(guild.iconURL
			|| 'https://68.media.tumblr.com/36598cb6de45f077431b7920e3093da6/tumblr_omdagm8mC91v6lhveo1_500.png')
			.setTitle(`I have ${left ? 'left' : 'joined'} a guild!`)
			.setDescription(`I am now on ${totalGuilds} guilds.`)
			// TODO: What is this hsv -> rgb -> hex conversion?
			// .setColor()
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
}

module.exports = Client;
