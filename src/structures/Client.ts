import {
	Client as DJSClient,
	ClientOptions,
	Guild,
	GuildChannel,
	GuildMember,
	MessageEmbed,
	MessageEmbedOptions,
	MessageReaction,
	RateLimitData,
	TextChannel,
	User,
} from 'discord.js';
import { join } from 'path';
import { captureBreadcrumb, captureException } from 'raven';
import { post } from 'snekfetch';

import { ListenerUtil } from '../decorators/ListenerUtil';
import { RavenContext } from '../decorators/RavenContext';
import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { IResponsiveEmbedController } from '../types/IResponsiveEmbedController';
import { UserTypes } from '../types/UserTypes';
import { generateColor } from '../util/generateColor';
import { CommandHandler } from './CommandHandler';
import { Loggable, Logger } from './Logger';
import { WebhookLogger } from './WebhookLogger';

const { on, once, registerListeners }: typeof ListenerUtil = ListenerUtil;
const { dbots, dbotsorg }: {
	dbots: string;
	dbotsorg: string;
} = require('../../data');

/**
 * Extended discord.js client
 */
@Loggable
export class Client extends DJSClient {
	/**
	 * Command handler of the client
	 */
	public readonly commandHandler: CommandHandler;
	/**
	 * Like the Logger but also sends messages to a webhook
	 */
	public readonly webhook: WebhookLogger = WebhookLogger.instance;

	/**
	 * Reference to the logger
	 */
	private readonly logger: Logger;

	/**
	 * Instantiate the client
	 */
	public constructor(options: ClientOptions) {
		super(options);

		this.commandHandler = new CommandHandler(this);
		this.commandHandler.loadCategoriesIn(join(__dirname, '..', 'commands'));

		registerListeners(this);
	}

	@once('ready')
	protected _onceReady(): void {
		(this as any).ws.connection.on('close', this._onDisconnect.bind(this));

		this.webhook.info('Ready', `Logged in as ${this.user.tag} (${this.user.id})`);
		if (this.shard.id === 0 && this.user.id === '297459926505095180') {
			this.setInterval(this._updateBotLists.bind(this), 30 * 60 * 1000);
		}
	}

	@on('disconnect')
	protected _onDisconnect({ code, reason }: { code: number; reason: string }): void {
		this.webhook.warn('Disconnect', `Code: \`${code}\`\nReason: \`${reason || 'No reason available'}\``);
	}

	@on('error')
	protected _onError(error: Error): void {
		this.webhook.error('Client Error', error);
	}

	@on('guildCreate', false)
	@on('guildDelete', true)
	protected async _onGuild(guild: Guild, left: boolean): Promise<void> {
		if (!left && guild.memberCount !== guild.members.size) await guild.members.fetch();

		const totalGuilds: number = await this.shard.fetchClientValues('guilds.size')
			.then((result: number[]) => result.reduce((prev: number, cur: number) => prev + cur));
		const blacklisted: string = await UserModel.fetchOrCache(guild.ownerID)
			.then((user: UserModel) => user.type === UserTypes.BLACKLISTED ? 'Yes' : 'No');
		const botCount: number = guild.members.filter((member: GuildMember) => member.user.bot).size;

		const embed: MessageEmbedOptions = (new MessageEmbed()
			.setThumbnail(guild.iconURL())
			.setTitle(`I have ${left ? 'left' : 'joined'} a guild!`)
			.setDescription(`I am now in ${totalGuilds} guilds.`)
			.setColor(generateColor())

			.addField('Name', `${guild.name} (${guild.id})`, true)
			.addField('Owner', `${guild.owner.user.tag} (${guild.ownerID})`, true)
			.addField('Blacklisted', blacklisted, true)

			.addField('Total Members', guild.memberCount, true)
			.addField('Humans', guild.memberCount - botCount, true)
			.addField('Bots', botCount, true) as any)

			._apiTransform();

		(this as any).api.channels('303180857030606849').messages.post({ data: { embed } });
	}

	@on('guildMemberAdd', false)
	@on('guildMemberLeave', true)
	protected async _onGuildMember(member: GuildMember, left: boolean): Promise<void> {
		const guildModel: GuildModel = await member.guild.fetchModel();

		if (!guildModel.notificationChannelId) return;
		const channel: GuildChannel = member.guild.channels.get(guildModel.notificationChannelId);

		if (!(channel instanceof TextChannel)) {
			guildModel.notificationChannelId = null;
			guildModel.save();

			return;
		}

		if (!channel.permissionsFor(member.guild.me).has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;

		let message: string = guildModel[left ? 'farewellMessage' : 'welcomeMessage'];
		if (!message) return;
		message = message.replace(/\{\{member\}\}/g, member.user.tag);

		channel.send(message);
	}

	@on('messageReactionAdd')
	@RavenContext
	protected _onMessageReactionAdd(reaction: MessageReaction, user: User): any {
		if (
			reaction.message.author.id !== this.user.id
			|| !reaction.message.embeds.length
			|| !reaction.message.embeds[0].footer
		) {
			reaction.message.channel.messages.delete(reaction.message.id);

			return;
		}

		captureBreadcrumb({
			category: 'messageReactAdd',
			data: reaction.message.embeds[0],
			message: 'Info about the embed',
		});

		const [, tag, name]: RegExpExecArray = /^Requested by (.+?) \|.* (.+)$/.exec(reaction.message.embeds[0].footer.text)
			|| [] as any;
		if (!tag || !name) {
			reaction.message.channel.messages.delete(reaction.message.id);

			return;
		}

		const command: IResponsiveEmbedController = this.commandHandler.resolveCommand(name.toLowerCase()) as any;
		if (!command) {
			reaction.message.channel.messages.delete(reaction.message.id);

			return;
		}

		if (user.tag !== tag || !command.emojis || !command.onCollect
			|| !command.emojis.includes(reaction.emoji.name)) {
			reaction.message.channel.messages.delete(reaction.message.id);

			return;
		}

		return command.onCollect(reaction, user);
	}

	@on('rateLimit')
	protected _onRateLimit(data: RateLimitData): void {
		this.webhook.warn('Rate Limited', '```js\n', data, '```');
	}

	@on('raw')
	@RavenContext
	protected async _onRaw({ t: type, d: data }: any): Promise<void> {
		if (type !== 'MESSAGE_REACTION_ADD') return;

		captureBreadcrumb({
			category: type,
			data,
			message: 'Info about the raw event',
		});

		const channel: TextChannel = this.channels.get(data.channel_id) as TextChannel;
		if (channel.messages.has(data.message_id)
			|| !channel.permissionsFor(channel.guild.me).has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'])
		) return;

		const user: User = this.users.get(data.user_id);
		const message = await channel.messages.fetch(data.message_id).catch(() => undefined);
		if (!message) return;

		let reaction: MessageReaction = message.reactions.get(data.emoji.id || data.emoji.name);

		if (!reaction) {
			reaction = message.reactions.add({
				count: 0,
				emoji: data.emoji,
				me: user.id === this.user.id,
			});
		}

		this.emit('messageReactionAdd', reaction, user);
	}

	@on('reconnecting')
	protected _onReconnecting(): void {
		this.webhook.info('Reconnecting');
	}

	@on('resumed')
	protected _onResume(replayed: number): void {
		this.webhook.info('Resumed', `Replayed \`${replayed}\` events.`);
	}

	@on('warn')
	protected _onWarn(warning: string): void {
		this.webhook.warn('Client Warn', warning);
	}

	@RavenContext
	private async _updateBotLists(): Promise<void> {
		const body: { server_count: number } = {
			server_count: await this.shard.fetchClientValues('guilds.size')
				.then((res: number[]) => res.reduce((prev: number, cur: number) => prev + cur)),
		};

		// No webhook, this will just spam
		this.logger.debug('BotLists', `Updating guild count at bot lists to ${body.server_count}.`);

		post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`)
			.set('Authorization', dbots)
			.send(body)
			.then(() => this.logger.info('BotLists', 'Updated bots.discord\'s guild count.'))
			.catch((error: Error) => {
				captureException(error, {
					extra: { server_count: body.server_count },
					tags: { target: 'bots.discord.pw' },
				});
				this.webhook.error('BotLists', 'Updating bots.discord\'s guild count failed:', error);
			});

		post(`https://discordbots.org/api/bots/${this.user.id}/stats`)
			.set('Authorization', dbotsorg)
			.send(body)
			.then(() => this.logger.info('BotLists', 'Updated discordbots\' guild count.'))
			.catch((error: Error) => {
				captureException(error, {
					extra: { server_count: body.server_count },
					tags: { target: 'discordbots.org' },
				});
				this.webhook.error('BotLists', 'Updating discordbots\'s guild count failed:', error);
			});
	}
}
