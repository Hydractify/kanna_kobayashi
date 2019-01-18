import { Message } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class HidePartnerCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			description: 'Hides or unhides your partner in your profile.',
			examples: ['hidepartner'],
			exp: 0,
			usage: 'hidepartner',
		});
	}

	public async run(message: Message, _: string[], { authorModel }: ICommandRunInfo)
		: Promise<any> {
		const response: string = authorModel.partnerHidden
			? 'your partner is no longer hidden.'
			: 'your partner is now hidden.';

		authorModel.partnerHidden = !authorModel.partnerHidden;
		await authorModel.save();

		return message.reply(response);
	}

}

export { HidePartnerCommand as Command };
