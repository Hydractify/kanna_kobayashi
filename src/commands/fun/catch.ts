import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';

class CatchCommand extends Command 
{
	public constructor(handler: CommandHandler) 
	{
		super(handler, {
			aliases: ['bughunt'],
			description: 'Grab your Bug Net and let\'s go catch some bugs!',
			examples: ['catch'],
			exp: 0,
			usage: 'catch',
		});
	}

	public async run(message: GuildMessage): Promise<Message | Message[]> 
	{
		let bugAmount: number = 0;

		const bugChance: number = Math.floor(Math.random() * 100) + 1;

		if (bugChance === 100) 
		{
			bugAmount = 6;
		}
		else if (bugChance > 90) 
		{
			bugAmount = 5;
		}
		else if (bugChance > 80) 
		{
			bugAmount = 4;
		}
		else if (bugChance > 70) 
		{
			bugAmount = 3;
		}
		else if (bugChance > 60) 
		{
			bugAmount = 2;
		}
		else if (bugChance > 50) 
		{
			bugAmount = 1;
		}

		return message.channel.send(`You ${bugAmount ? `got **${bugAmount}** bugs! 🐛` : 'did not get any bugs...'}`);
	}
}

export { CatchCommand as Command };
