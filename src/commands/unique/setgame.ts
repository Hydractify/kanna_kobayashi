import { Client, Message, Presence, WebSocketShard } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';

class SetGameCommand extends Command {
	public constructor(handler: CommandHandler) {
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
	}

	public async run(message: GuildMessage, args: string[]): Promise<Message | Message[]> {
		if (!args.length) {
			const totalGuilds: number = await this.client.shard!.fetchClientValues('guilds.size')
				.then((result: number[]) => result.reduce((acc: number, current: number) => acc + current));

			await this.client.shard!.broadcastEval(this.setActivity, [`k!help | on ${totalGuilds} guilds`]);
		} else {
			let stream: string = '';
			if (args[0].toLowerCase() === 'stream') {
				args = args.slice(1);
				stream = 'https://twitch.tv/wizardlink';
			}

			await this.client.shard!.broadcastEval(this.setActivity, [args.join(' '), stream]);
		}

		return message.channel.send('Updated presence status successfully on all shards!');
	}

	private setActivity(client: Client, [game, stream]: string[]): Promise<Presence[]> {
		return Promise.all(
			client.ws.shards.map((shard: WebSocketShard, shardId: number) =>
				client.user!.setActivity({
					name: `${game} [${shardId}]`,
					shardID: shardId,
					type: stream ? 'STREAMING' : 'PLAYING',
					url: stream || undefined,
				}),
			),
		);
	}
}

export { SetGameCommand as Command };
