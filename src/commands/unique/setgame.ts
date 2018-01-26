import { Client, Message, Presence } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';

class SetGameCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['sg'],
			coins: 0,
			cooldown: 0,
			description: 'Sets the game the bot is currently playing on all shards',
			examples: ['setgame Some cool game'],
			exp: 0,
			name: 'setgame',
			permLevel: PermLevels.DEV,
			usage: 'setgame [\'stream\'] [...Game]',
		});
	}

	public async run(message: Message, args: string[]): Promise<Message | Message[]> {
		if (!args.length) {
			const totalGuilds: number = await this.client.shard.fetchClientValues('guilds.size')
				.then((result: number[]) => result.reduce((acc: number, current: number) => acc + current));

			await this.client.shard.broadcastEval(this.setActivity, [`k!help | on ${totalGuilds} guilds`]);
		} else {
			let stream: string;
			if (args[0].toLowerCase() === 'stream') {
				args = args.slice(1);
				stream = ', \'https://twitch.tv/wizzardlink\'';
			}

			await this.client.shard.broadcastEval(this.setActivity, [args.join(' '), stream]);
		}

		return message.channel.send('Updated presence status successfully on all shards!');
	}

	private setActivity(client: Client, [game, stream]: string[]): Promise<Presence> {
		return client.user.setActivity(`${game} [${client.shard.id}]`, {
			type: stream ? 'STREAMING' : 'PLAYING',
			url: stream,
		});
	}
}

export { SetGameCommand as Command };
