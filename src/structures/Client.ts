import
{
	Client as DJSClient,
	ClientOptions,
	Guild,
	GuildChannel,
	GuildMember,
	MessageEmbedOptions,
	MessageReaction,
	Snowflake,
	TextChannel,
	User,
} from 'discord.js';
import { join } from 'path';
import { Counter, Gauge, register } from 'prom-client';
import { captureBreadcrumb } from 'raven';

import { Command as SetGameCommand } from '../commands/unique/setgame';
import { ListenerUtil } from '../decorators/ListenerUtil';
import { RavenContext } from '../decorators/RavenContext';
import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { isGuildMessage } from '../types/GuildMessage';
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
export class Client extends DJSClient
{
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
	public constructor(options: ClientOptions)
	{
		super(options);

		this.commandHandler = new CommandHandler(this);
		this.commandHandler.loadCategoriesIn(join(__dirname, '..', 'commands'));

		// Pad the number with zeros at the beginning for sorting
		const shardId: string = (this.options.shards as [number])[0]
			.toString()
			.padStart(this.options.shardCount!.toString().length, '0');

		/* eslint-disable-next-line @typescript-eslint/camelcase */
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
	/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
	public getMetrics()
	{
		return register.getMetricsAsJSON();
	}

	@on('shardReady')
	@RavenContext
	protected _onShardReady(id: number, unavailableGuilds?: Set<Snowflake>): void
	{
		let logMessage = 'Up and running!';
		if (unavailableGuilds)
		{
			logMessage += `\nThere were ${unavailableGuilds.size} unavailable guilds.`;
		}

		this.webhook.info(`ShardReady [${id}]`, id, logMessage);
	}

	@on('ready')
	@RavenContext
	protected async _onReady(): Promise<void>
	{
		const id = this.shard!.ids[0]!;

		this._guildCount.set(this.guilds.cache.size);

		this.webhook.info(`ClientReady [${id}]`, id, 'Logged in and processing events!');

		if (id + 1 === this.options.shardCount)
		{
			// Set the activity on startup
			const setGameCommand: SetGameCommand = this.commandHandler.resolveCommand('setgame') as SetGameCommand;
			await setGameCommand.cleanup();
			await setGameCommand.publishActivity();
		}
	}

	@once('ready')
	@RavenContext
	protected _onceReady(): void
	{
		if (this.user!.id === '297459926505095180' && this.shard!.ids.includes(0))
		{
			this.setInterval(updateBotLists.bind(this), 30 * 60 * 1000);
		}
	}

	@on('shardDisconnect')
	@RavenContext
	protected _onDisconnect({ code, reason }: { code: number; reason: string }, id: number): void
	{
		// Only for fatal disconnects, should never happen.
		this.webhook.error(`shardDisconnect [${id}]`, id, `Code: \`${code}\`\nReason: \`${reason || 'No reason available'}\``);
	}

	@on('shardError')
	@RavenContext
	protected _onError(error: Error, id: number): void
	{
		this.errorCount.inc({ type: 'WebSocket' });

		this.webhook.error(`ShardError [${id}]`, id, error);
	}

	@on('guildCreate', false)
	@on('guildDelete', true)
	@RavenContext
	protected async _onGuild(guild: Guild, left: boolean): Promise<void>
	{
		this._guildCount.set(this.guilds.cache.size);
		captureBreadcrumb({ category: left ? 'guildDelete' : 'guildCreate', level: 'debug' });

		if (!left && guild.memberCount !== guild.members.cache.size) await guild.members.fetch();

		const totalGuilds: number = await this.shard!.broadcastEval(client => client.guilds.cache.size)
			.then((result: number[]) => result.reduce((acc: number, current: number) => acc + current));
		const blacklisted: string = await UserModel.fetch(guild.ownerID)
			.then((user: UserModel) => user.type === UserTypes.BLACKLISTED ? 'Yes' : 'No');
		const botCount: number = guild.members.cache.filter((member: GuildMember) => member.user.bot).size;
		const owner: User = this.users.cache.get(guild.ownerID) || await this.users.fetch(guild.ownerID);

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
			.toJSON();

		(this as any).api.channels('303180857030606849').messages.post({ data: { embed } });
	}

	@on('guildMemberAdd', false)
	@on('guildMemberRemove', true)
	@RavenContext
	protected async _onGuildMember(member: GuildMember, left: boolean): Promise<void>
	{
		captureBreadcrumb({
			category: left ? 'guildMemberRemove' : 'guildMemberAdd',
			data: {
				guild: `${member.guild.name} (${member.guild.id})`,
				member: `${member.user.tag} (${member.id})`,

				mePresent: {
					guild: this.guilds.cache.get(member.guild.id)?.members.cache.has(this.user!.id) ?? 'Error',
					member: Boolean(member.guild.me),
				},
				referenceEqual: member.guild === this.guilds.cache.get(member.guild.id),
			},
			message: 'Info about the guild member event',
		});

		const guildModel: GuildModel = await member.guild.fetchModel();

		if (!guildModel.notificationChannelId) return;
		const channel: GuildChannel | undefined = member.guild.channels.cache.get(guildModel.notificationChannelId);

		if (!(channel instanceof TextChannel))
		{
			guildModel.notificationChannelId = null;
			guildModel.save();

			return;
		}

		const meMember: GuildMember = member.guild.me || await member.guild.members.fetch(this.user!);
		if (!(channel.permissionsFor(meMember)?.has(['VIEW_CHANNEL', 'SEND_MESSAGES'] ?? false))) return;

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
	protected async _onMessageReactionAdd(reaction: MessageReaction, user: User): Promise<any>
	{
		// Pre discord ready?
		if (!this.user) return;
		// Ignore reactions in dms
		if (!(isGuildMessage(reaction.message))) return;
		// Ensure own member is cached in the current guild
		if (!reaction.message.guild.me) await reaction.message.guild.members.fetch(this.user);

		if (reaction.partial || reaction.message.partial)
		{
			// Only attempt to fetch if we can actually fetch
			if (!(reaction.message.channel.permissionsFor(this.user)?.has(['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY']) ?? false)) return;

			try
			{
				if (reaction.partial) reaction = await reaction.fetch();
				if (reaction.message.partial) reaction.message = await reaction.message.fetch();
			}
			catch (e)
			{
				// Ignore Unknown Message errors
				if (e.code === 10008) return;
				this.errorCount.inc({ type: 'Reaction' });
				const shardID = reaction.message.guild!.shardID;
				this.webhook.error(`ReactionError [${shardID}]`, shardID, e);

				return;
			}
		}
		if (reaction.message.author.id !== this.user.id
			|| !reaction.message.embeds.length
			|| !reaction.message.embeds[0].footer
		)
		{
			reaction.message.channel.messages.cache.delete(reaction.message.id);

			return;
		}

		captureBreadcrumb({
			category: 'messageReactAdd',
			data: reaction.message.embeds[0],
			message: 'Info about the embed',
		});

		const [, tag, name]: string[] = /^Requested by (.+?) \u200b\|.* (.+)$/
			.exec(reaction.message.embeds[0].footer.text!) ?? [];
		if (!tag || !name)
		{
			reaction.message.channel.messages.cache.delete(reaction.message.id);

			return;
		}

		const command: IResponsiveEmbedController = this.commandHandler.resolveCommand(name.toLowerCase()) as any;
		if (!command)
		{
			reaction.message.channel.messages.cache.delete(reaction.message.id);

			return;
		}

		if (user.tag !== tag || !command.emojis || !command.onCollect
			|| !command.emojis.includes(reaction.emoji.name))
		{
			reaction.message.channel.messages.cache.delete(reaction.message.id);

			return;
		}

		return command.onCollect(reaction, user);
	}

	@on('shardReconnecting')
	@RavenContext
	protected _onReconnecting(id: number): void
	{
		this.webhook.info(`Reconnecting [${id}]`, id, 'Shard is reconnecting...');
	}

	@on('warn')
	@RavenContext
	protected _onWarn(warning: string): void
	{
		const id = this.shard!.ids[0]!;
		this.webhook.warn(`Client Warn [${id}]`, id, warning);
	}

	@on('debug')
	@RavenContext
	protected _onDebug(info: string): void
	{
		let exec: RegExpExecArray | null = /^\[WS => (?:Shard )?(\d+|Manager)\] +([\s\S]+)$/.exec(info);
		if (!exec) return;
		const [, rawId, info2]: [string, string, string] = exec as any;
		const id: number | 'Manager' = rawId === 'Manager' ? rawId : parseInt(rawId);

		/* eslint-disable no-cond-assign */
		// Discord requested a reconnect
		if (exec = /\s*\[RECONNECT\]\s*(.+)\s*/.exec(info2))
		{
			this.webhook.info(`Reconnect [${id}]`, id, exec[1]);
		}

		// Discord invalidated our session somehow
		if (exec = /\s*\[INVALID SESSION\]\s*(.+)\s*/.exec(info2))
		{
			this.webhook.warn(`Invalid Session [${id}]`, id, exec[1]);
		}

		// Identifying as a new session
		if (exec = /\s*\[IDENTIFY\]\s*(.+)\s*/.exec(info2))
		{
			this.webhook.warn(`Identify [${id}]`, id, exec[1]);
		}

		// Resuming an existing session after reconnecting
		if (exec = /\s*\[RESUME\]\s*(.+)\s*/.exec(info2))
		{
			this.webhook.warn(`Resume [${id}]`, id, exec[1]);
		}

		// discord.js fetched new session limit informations
		if (exec = /^Session Limit Information\s*\n\s*Total:\s*(.+)\s*\n\s*Remaining:\s*(.+)/.exec(info2))
		{
			this.webhook.info(`Session Limit Information [${id}]`, id, 'Identifies:', exec[2], '/', exec[1]);

			return;
		}

		// The websocket closed for some reason
		if (exec = /^\[CLOSE\]\s*\n\s*Event Code\s*:\s*(.+)\s*\n\s*Clean\s*:\s*(.+)\s*\n\s*Reason\s*:\s*(.+)/.exec(info2))
		{
			this.webhook.info(`WebSocket was closed [${id}]`, id, 'Code:', exec[1], ' Clean:', exec[2], ' Reason:', exec[3]);

			return;
		}
		/* eslint-enable no-cond-assign */
	}

	@on('raw')
	@RavenContext
	protected _onRaw(event: { op: number; d: any; s?: number; t?: string }): void
	{
		this._eventCount.inc({
			type: event.t || event.op,
		});
	}
}
