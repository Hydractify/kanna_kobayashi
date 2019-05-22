import {
	Client as DJSClient,
	ClientOptions,
	Guild,
	GuildChannel,
	GuildMember,
	MessageEmbedOptions,
	MessageReaction,
	TextChannel,
	User,
} from 'discord.js';
import { join } from 'path';
import { Counter, Gauge, register } from 'prom-client';
import { captureBreadcrumb } from 'raven';

import { ListenerUtil } from '../decorators/ListenerUtil';
import { RavenContext } from '../decorators/RavenContext';
import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { IResponsiveEmbedController } from '../types/IResponsiveEmbedController';
import { UserTypes } from '../types/UserTypes';
import { updateBotLists } from '../util/botlists';
import { generateColor } from '../util/generateColor';
import { CommandHandler } from './CommandHandler';
import { MessageEmbed } from './MessageEmbed';
import { WebhookLogger } from './WebhookLogger';

const { on, once, registerListeners }: typeof ListenerUtil = ListenerUtil;

/**
 * Extended discord.js client
 */
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
	 * Counter for errors of any kind.
	 */
	public readonly errorCount: Counter = new Counter({
		help: 'Number of occurred errors',
		labelNames: ['type'],
		name: 'kanna_kobayashi_error_count',
	});

	/**
	 * Counter for received gateway events.
	 */
	private readonly _eventCount: Counter = new Counter({
		help: 'Number of events received',
		labelNames: ['type'],
		name: 'kanna_kobayashi_event_count',
	});

	/**
	 * Gauge for the current guild count
	 */
	private readonly _guildCount: Gauge = new Gauge({
		help: 'Number of guilds',
		name: 'kanna_kobayashi_guild_count',
	});

	/**
	 * Instantiate the client
	 */
	public constructor(options: ClientOptions) {
		super(options);

		this.commandHandler = new CommandHandler(this);
		this.commandHandler.loadCategoriesIn(join(__dirname, '..', 'commands'));

		// Pad the number with zeros at the beginning for sorting
		const shardId: string = (this.options.shards as [number])[0]
			.toString()
			.padStart(this.options.totalShardCount!.toString().length, '0');

		register.setDefaultLabels({ shard_id: shardId });

		// To get a stat here, not simply nothing
		this.errorCount.inc(0);

		registerListeners(this);
	}

	/**
	 * Fetches the metrics of the current process.
	 *
	 * (Used internally when accessing /metrics in the Sharding Manager)
	 */
	public getMetrics() {
		return register.getMetricsAsJSON();
	}

	@on('shardReady')
	@RavenContext
	protected _onShardReady(id: number): void {
		this.webhook.info('Ready', id, 'Up and running!');
	}

	@on('ready')
	@RavenContext
	protected _onReady(): void {
		this._guildCount.set(this.guilds.size);

		this.webhook.info('Ready', 'Manager', 'Logged in and processing events!');
	}

	@once('ready')
	@RavenContext
	protected _onceReady(): void {
		if (this.user!.id === '297459926505095180' && false) {
			this.setInterval(updateBotLists.bind(this), 30 * 60 * 1000);
		}
	}

	@on('shardDisconnect')
	@RavenContext
	protected _onDisconnect({ code, reason }: { code: number; reason: string }, id: number): void {
		this.webhook.warn('shardDisconnect', id, `Code: \`${code}\`\nReason: \`${reason || 'No reason available'}\``);
	}

	@on('shardError')
	@RavenContext
	protected _onError(error: Error, id: number): void {
		this.errorCount.inc({ type: 'WebSocket' });

		this.webhook.error('ShardError', id, error);
	}

	@on('guildCreate', false)
	@on('guildDelete', true)
	@RavenContext
	protected async _onGuild(guild: Guild, left: boolean): Promise<void> {
		this._guildCount.set(this.guilds.size);
		captureBreadcrumb({ category: left ? 'guildDelete' : 'guildCreate', level: 'debug' });

		if (!left && guild.memberCount !== guild.members.size) await guild.members.fetch();

		const totalGuilds: number = await this.shard.fetchClientValues('guilds.size')
			.then((result: number[]) => result.reduce((acc: number, current: number) => acc + current));
		const blacklisted: string = await UserModel.fetch(guild.ownerID)
			.then((user: UserModel) => user.type === UserTypes.BLACKLISTED ? 'Yes' : 'No');
		const botCount: number = guild.members.filter((member: GuildMember) => member.user.bot).size;
		const owner: User = this.users.get(guild.ownerID) || await this.users.fetch(guild.ownerID);

		const embed: MessageEmbedOptions = new MessageEmbed()
			.setThumbnail(guild.iconURL())
			.setTitle(`I have ${left ? 'left' : 'joined'} a guild!`)
			.setDescription(`I am now in ${totalGuilds} guilds.`)
			.setColor(generateColor())

			.addField('Name', `${guild.name} (${guild.id})`, true)
			.addField('Owner', `${owner.tag} (${guild.ownerID})`, true)
			.addField('Blacklisted', blacklisted, true)

			.addField('Total Members', guild.memberCount, true)
			.addField('Humans', guild.memberCount - botCount, true)
			.addField('Bots', botCount, true)
			.apiTransform();

		(this as any).api.channels('303180857030606849').messages.post({ data: { embed } });
	}

	@on('guildMemberAdd', false)
	@on('guildMemberRemove', true)
	@RavenContext
	protected async _onGuildMember(member: GuildMember, left: boolean): Promise<void> {
		captureBreadcrumb({
			category: left ? 'guildMemberRemove' : 'guildMemberAdd',
			data: {
				guild: `${member.guild.name} (${member.guild.id})`,
				member: `${member.user.tag} (${member.id})`,

				mePresent: {
					guild: this.guilds.get(member.guild.id)!.members.has(this.user!.id),
					member: member.guild.members.has(this.user!.id),
				},
				referenceEqual: member.guild === this.guilds.get(member.guild.id),
			},
			message: 'Info about the guild member event',
		});

		const guildModel: GuildModel = await member.guild.fetchModel();

		if (!guildModel.notificationChannelId) return;
		const channel: GuildChannel | undefined = member.guild.channels.get(guildModel.notificationChannelId);

		if (!(channel instanceof TextChannel)) {
			guildModel.notificationChannelId = null;
			guildModel.save();

			return;
		}

		if (!member.guild.me) await member.guild.members.fetch(this.user!);
		if (!channel.permissionsFor(member.guild.me)!.has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;

		let message: string | null = guildModel[left ? 'farewellMessage' : 'welcomeMessage'];
		if (!message) return;
		message = message
			.replace(/\{\{guild\}\}/g, member.guild.name)
			.replace(/\{\{member\}\}/g, member.user.tag)
			.replace(/\{\{mention\}\}/g, member.toString());

		channel.send(message);
	}

	@on('messageReactionAdd')
	@RavenContext
	protected async _onMessageReactionAdd(reaction: MessageReaction, user: User): Promise<any> {
		// Pre discord ready?
		if (!this.user) return;
		// Ignore reactions in dms
		if (!(reaction.message.channel instanceof TextChannel)) return;
		// Ensure own member is cached in the current guild
		if (!reaction.message.guild.me) await reaction.message.guild.members.fetch(this.user);

		if (reaction.message.partial) {
			// Only attempt to fetch if we can actually fetch
			if (!reaction.message.channel.permissionsFor(this.user)!.has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY'])) return;

			try {
				// If the message gets uncached, discord.js won't find a reference to it and creates a new instance
				reaction.message = await reaction.message.fetch();
			} catch (e) {
				// Ignore Unknown Message errors
				if (e.code === 10008) return;
				this.errorCount.inc({ type: 'Reaction' });
				this.webhook.error('ReactionError', reaction.message.guild.shardID, e);

				return;
			}
		}
		if (reaction.message.author.id !== this.user.id
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

		const [, tag, name]: RegExpExecArray = /^Requested by (.+?) \u200b\|.* (.+)$/
			.exec(reaction.message.embeds[0].footer.text!)
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

	@on('shardReconnecting')
	@RavenContext
	protected _onReconnecting(id: number): void {
		this.webhook.info('Reconnecting', id, 'Shard is reconnecting...');
	}

	@on('warn')
	@RavenContext
	protected _onWarn(warning: string): void {
		this.webhook.warn('Client Warn', warning);
	}

	@on('debug')
	@RavenContext
	protected _onDebug(info: string): void {
		let exec: RegExpExecArray | null = /^\[WS => (?:Shard )?(\d+|Manager)\] +([\s\S]+)$/.exec(info);
		if (!exec) return;
		const [, rawId, info2]: [string, string, string] = exec as any;
		const id: number | 'Manager' = rawId === 'Manager' ? rawId : parseInt(rawId);

		// tslint:disable-next-line:no-conditional-assignment
		if (exec = /^Session Limit Information *\n *Total: *(.+) *\n *Remaining: *(.+)/.exec(info2)) {
			this.webhook.info('Session Limit Information', id, 'Identifies:', exec[2], '/', exec[1]);

			return;
		}

		// tslint:disable-next-line:no-conditional-assignment
		if (exec = /^WebSocket was closed. *\n *Event Code: *(.+) *\n *Clean: (.+) *\n *Reason: *(.+)/.exec(info2)) {
			this.webhook.info('WebSocket was closed', id, 'Code:', exec[1], ' Clean:', exec[2], ' Reason:', exec[2]);

			return;
		}
	}

	@on('raw')
	@RavenContext
	protected _onRaw(event: { op: number, d: any, s?: number, t?: string }): void {
		this._eventCount.inc({
			type: event.t || event.op,
		});
	}
}
