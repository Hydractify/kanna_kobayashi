import { Message, Presence } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
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

	public async run(message: Message, args: string[]): Promise<Message | Message[]> {
		if (!args.length) {
			this.setActivity([`k!help | on ${this.client.guilds.size} guilds`]);
		} else {
			let stream: string = '';
			if (args[0].toLowerCase() === 'stream') {
				args = args.slice(1);
				stream = ', \'https://twitch.tv/wizardlinkk\'';
			}

			this.setActivity([args.join(' '), stream]);
		}

		return message.channel.send('Updated presence status successfully on all shards!');
	}

	private setActivity([game, stream]: string[]): Promise<Presence> {
		return this.client.user!.setActivity(game, {
			type: stream ? 'STREAMING' : 'PLAYING',
			url: stream,
		});
	}
}

export { SetGameCommand as Command };
