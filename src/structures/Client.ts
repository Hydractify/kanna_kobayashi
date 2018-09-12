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
import { captureBreadcrumb } from 'raven';

import { ListenerUtil } from '../decorators/ListenerUtil';
import { RavenContext } from '../decorators/RavenContext';
import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { IResponsiveEmbedController } from '../types/IResponsiveEmbedController';
import { UserTypes } from '../types/UserTypes';
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
	 * Instantiate the client
	 */
	public constructor(options: ClientOptions) {
		super(options);

		this.commandHandler = new CommandHandler(this);
		this.commandHandler.loadCategoriesIn(join(__dirname, '..', 'commands'));

		registerListeners(this);
	}

	@once('ready')
	@RavenContext
	protected _onceReady(): void {
		(this as any).ws.connection.on('close', this._onDisconnect.bind(this));
	}

	@on('disconnect')
	@RavenContext
	protected _onDisconnect({ code, reason }: { code: number; reason: string }): void {
		this.webhook.warn('Disconnect', `Code: \`${code}\`\nReason: \`${reason || 'No reason available'}\``);
	}

	@on('error')
	@RavenContext
	protected _onError(error: Error): void {
		this.webhook.error('Client Error', error);
	}

	@on('guildCreate', false)
	@on('guildDelete', true)
	@RavenContext
	protected async _onGuild(guild: Guild, left: boolean): Promise<void> {
		captureBreadcrumb({ category: left ? 'guildDelete' : 'guildCreate', level: 'debug' });

		if (!left && guild.memberCount !== guild.members.size) await guild.members.fetch();

		const totalGuilds: number = await this.shard.fetchClientValues('guilds.size')
			.then((result: number[]) => result.reduce((prev: number, cur: number) => prev + cur));
		const blacklisted: string = await UserModel.fetch(guild.ownerID)
			.then((user: UserModel) => user.type === UserTypes.BLACKLISTED ? 'Yes' : 'No');
		const botCount: number = guild.members.filter((member: GuildMember) => member.user.bot).size;

		const embed: MessageEmbedOptions = new MessageEmbed()
			.setThumbnail(guild.iconURL())
			.setTitle(`I have ${left ? 'left' : 'joined'} a guild!`)
			.setDescription(`I am now in ${totalGuilds} guilds.`)
			.setColor(generateColor())

			.addField('Name', `${guild.name} (${guild.id})`, true)
			.addField('Owner', `${guild.owner.user.tag} (${guild.ownerID})`, true)
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
					guild: this.guilds.get(member.guild.id).members.has(this.user.id),
					member: member.guild.members.has(this.user.id),
				},
				referenceEqual: member.guild === this.guilds.get(member.guild.id),
			},
			message: 'Info about the guild member event',
		});

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
		message = message
			.replace(/\{\{guild\}\}/g, member.guild.name)
			.replace(/\{\{member\}\}/g, member.user.tag);

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
		if (!channel) return;
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
	@RavenContext
	protected _onReconnecting(): void {
		this.webhook.info('Reconnecting');
	}

	@on('resumed')
	@RavenContext
	protected _onResume(replayed: number): void {
		this.webhook.info('Resumed', `Replayed \`${replayed}\` events.`);
	}

	@on('warn')
	@RavenContext
	protected _onWarn(warning: string): void {
		this.webhook.warn('Client Warn', warning);
	}
}
