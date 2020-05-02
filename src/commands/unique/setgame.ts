import { ActivityOptions, Message, Presence, WebSocketShard } from 'discord.js';

import { Client } from '../../structures/Client';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';


class SetGameCommand extends Command
{
	// Timer regularly setting the activity.
	private timer: NodeJS.Timeout | null;
	// Time to wait between setting the activity
	private timeout: number;
	// Activity to regularly set, if null, use guild count.
	private activity: ActivityOptions | null;

	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['sg'],
			cooldown: 0,
			description: 'Set the game I am currently playing on all shards',
			examples: ['setgame something'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.TRUSTED,
			usage: 'setgame [\'stream\'] [...Game]',
		});

		// Update presence once per hour
		this.timeout = 1 * 60 * 60 * 1000;
		this.timer = null;
		this.activity = null;
	}

	public async run(message: GuildMessage, args: string[]): Promise<Message | Message[]>
	{
		await this.cleanup();

		if (!args.length)
		{
			this.activity = null;
		}
		else if (args[0].toLowerCase() === 'stream')
		{
			this.activity = { type: 'STREAMING', url: 'https://twitch.tv/wizardlink', name: args.slice(1).join(' ') };
		}
		else
		{
			this.activity = { type: 'PLAYING', name: args.join(' ') };
		}

		await this.publishActivity();

		return message.channel.send('Updated presence activity successfully on all shards!');
	}

	/**
	 * Removes `activity` and `timer` from all shard's SetGameCommand instances.
	 * This does not actually clear the activity.
	 */
	public async cleanup(): Promise<void>
	{
		await this.client.shard!.broadcastEval((client: Client, [name]: string[]) =>
		{
			const command: this = client.commandHandler.resolveCommand(name) as this;
			command.activity = null;
			if (command.timer)
			{
				client.clearInterval(command.timer);
				command.timer = null;
			}
		}, [this.name]);
	}

	public async publishActivity(): Promise<void>
	{
		await this.client.shard!.broadcastEval(
			this.setActivity,
			[this.activity || await this.guildCount()],
		);

		this.timer = this.client.setInterval(async () =>
		{
			this.client.shard!.broadcastEval(
				this.setActivity,
				[this.activity || await this.guildCount()],
			);
		}, this.timeout);
	}

	private async guildCount(): Promise<ActivityOptions>
	{
		const totalGuilds: number = await this.client.shard!.broadcastEval((client: Client) => client.guilds.cache.size)
			.then((result: number[]) => result.reduce((acc: number, current: number) => acc + current));

		return { type: 'PLAYING', name: `k!help | on ${totalGuilds} guilds` };
	}

	private setActivity(client: Client, [activity]: ActivityOptions[]): Promise<Presence[]>
	{
		return Promise.all(
			client.ws.shards.map((shard: WebSocketShard, shardId: number) =>
				client.user!.setActivity({
					...activity,
					name: `${activity.name} [${shardId}]`,
					shardID: shardId,
				}),
			),
		);
	}
}

export { SetGameCommand as Command };
