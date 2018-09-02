import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { resolveAmount } from '../../util/Util';

class GambleCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Gamble your coins to get more!',
			examples: [
				'gamble 1000', 'gamble 1k',
				'gamble 1000000', 'gamble 1k',
				'gamble 1000000000', 'gamble 1b',
				'gamble 1234', 'gamble 1k234',
			],
			usage: 'gamble <Amount>',
		});
	}

	public parseArgs(
		message: Message,
		input: string[],
		{ authorModel }: ICommandRunInfo,
	): string | [number] {
		if (!input) return `you must give me an amount! (\`${this.usage}\`)`;

		const amount: number = resolveAmount(input.join(' '));
		if (isNaN(amount)) return `**${input}** is not a valid number!`;
		if (amount <= 0) return `**${input}** is not a positive number!`;

		if (amount > authorModel.coins) return `you do not own **${amount}** coins!`;

		return [amount];
	}

	public async run(
		message: Message,
		[wager]: [number],
		{ authorModel }: ICommandRunInfo,
	): Promise<Message | Message[]> {
		const value: number = Math.floor(Math.random() * 100) + 1;

		let multiplier: number = 0;
		if (value >= 100) multiplier = 4;
		else if (value >= 80) multiplier = 2;
		else if (value >= 60) multiplier = 1;

		const won: number = wager * multiplier;

		await Promise.all([
			this.redis.hincrby(`users:${message.author.id}`, 'coins', won - wager),
			authorModel.increment({ coins: won - wager }),
		]);

		return message.reply(
			won
				? `you got **${won - wager}** coins! <:kannaShy:458779242696540170>`
				: `you lost **${wager}** coins! <:kannaScared:458776266154180609>`,
		);
	}
}

export { GambleCommand as Command };
