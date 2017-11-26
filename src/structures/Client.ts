import {
	Client as DJSClient,
	ClientOptions,
	Guild,
	GuildChannel,
	GuildMember,
	MessageEmbed,
	MessageEmbedOptions,
	TextChannel,
} from 'discord.js';
import { join } from 'path';
import { captureException } from 'raven';
import { post } from 'snekfetch';

import { Guild as GuildModel } from '../models/Guild';
import { User as UserModel } from '../models/User';
import { UserTypes } from '../types/UserTypes';
import { generateColor } from '../util/generateColor';
import { ListenerUtil } from '../util/ListenerUtil';
import { CommandHandler } from './CommandHandler';
import { Loggable, Logger } from './Logger';

const { on, once, registerListeners }: typeof ListenerUtil = ListenerUtil;
const { dbots, dbotsorg }: {
	dbots: string;
	dbotsorg: string;
} = require('../data');

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
		this.logger.info('READY', `Logged in as ${this.user.tag} (${this.user.id})`);
		if (this.shard.id === 0 && this.user.id === '297459926505095180') {
			this.setInterval(this._updateBotLists.bind(this), 30 * 60 * 1000);
		}
	}

	@on('disconnect')
	protected _onDisconnect({ code, reason }: { code: number; reason: string }): void {
		this.logger.warn('DISCONNECT', `Bot disconnected.\nCode:${code} | ${reason || 'No reason available'}`);
	}

	@on('error')
	protected _onError(error: Error): void {
		this.logger.error('CLIENT', error);
	}

	@on('guildCreate', false)
	@on('guildLeave', true)
	protected async _onGuild(guild: Guild, left: boolean): Promise<void> {
		if (guild.memberCount !== guild.members.size) await guild.members.fetch();

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
			// tslint:disable-next-line:no-any
			.addField('Bots', botCount, true) as any)

			._apiTransform();

		// tslint:disable-next-line:no-any
		(this as any).api.channels('303180857030606849').messages.post({ data: { embed } });
	}

	@on('guildMemberAdd', false)
	@on('guildMemberLeave', true)
	protected async _onGuildMember(member: GuildMember, left: boolean): Promise<void> {
		const guildModel: GuildModel = await member.guild.fetchModel();

		if (!guildModel.notificationChannelId) return;
		const channel: GuildChannel = member.guild.channels.get(guildModel.notificationChannelId);

		if (!(channel instanceof TextChannel)) {
			guildModel.notificationChannelId = undefined;
			guildModel.save();

			return;
		}

		if (!channel.permissionsFor(member.guild.me).has(['VIEW_CHANNEL', 'SEND_MESSAGES'])) return;

		const message: string = guildModel[left ? 'farewellMessage' : 'welcomeMessage']
			.replace(/\{\{member\}\}/g, member.user.tag);

		channel.send(message);
	}

	@on('reconnecting')
	protected _onReconnecting(): void {
		this.logger.info('RECONNECTING', 'Reconnecting...');
	}

	@on('resumed')
	protected _onResume(replayed: number): void {
		this.logger.info('RESUMED', `Replayed ${replayed} events.`);
	}

	@on('warn')
	protected _onWarn(warning: string): void {
		this.logger.warn('CLIENT', warning);
	}

	private async _updateBotLists(): Promise<void> {
		const body: { server_count: number } = {
			server_count: await this.shard.fetchClientValues('guilds.size')
				.then((res: number[]) => res.reduce((prev: number, cur: number) => prev + cur)),
		};

		this.logger.debug('BotLists', `Updating guild count at bot lists to ${body.server_count}.`);

		post(`https://bots.discord.pw/api/bots/${this.user.id}/stats`)
			.set('Authorization', dbots)
			.send(body)
			.then(() => this.logger.debug('BotLists', 'Updated bots.discord\'s guild count.'))
			.catch((error: Error) => {
				captureException(error, {
					tags: { target: 'bots.discord.pw' },
					extra: { server_count: body.server_count },
				});
				this.logger.error('[BotLists]: Updating bots.discord\'s guild count failed:', error);
			});

		post(`https://discordbots.org/api/bots/${this.user.id}/stats`)
			.set('Authorization', dbotsorg)
			.send(body)
			.then(() => this.logger.info('BotLists', 'Updated discordbots\' guild count.'))
			.catch((error: Error) => {
				captureException(error, {
					tags: { target: 'discordbots.org' },
					extra: { server_count: body.server_count },
				});
				this.logger.error('[BotLists]: Updating discordbots\'s guild count failed:', error);
			});
	}
}
