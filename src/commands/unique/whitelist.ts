import { GuildMember, Message, User } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { PermLevels } from '../../types/PermLevels';
import { UserTypes } from '../../types/UserTypes';

class WhitelistCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			cooldown: 0,
			description: 'Whitelist a user, allowing their bot guilds to use the bot',
			examples: ['whitelist @space#0302'],
			exp: 0,
			guarded: true,
			permLevel: PermLevels.TRUSTED,
			usage: 'whitelist <User> [\'remove\']',
		});
	}

	public async run(message: GuildMessage, [target, remove]: [string, string]): Promise<Message | Message[]>
	{
		// To allow nicknames, I am so sure they will be used.
		const user: User | undefined = await this.resolver.resolveMember(target, message.guild, false)
			.then((member: GuildMember | undefined) => member ? member.user : this.resolver.resolveUser(target, false));
		if (!user) return message.reply(`I could not find a non-bot user by ${target}!`);

		const targetModel: UserModel = await user.fetchModel();
		if (['DEV', 'TRUSTED'].includes(targetModel.type!))
		{
			return message.reply('devs or trusted users can not be whitelisted. Maybe entered the wrong user?');
		}

		if (targetModel.type === UserTypes.WHITELISTED)
		{
			if (remove === 'remove')
			{
				targetModel.type = null;
				await targetModel.save();

				return message.reply(`you removed **${user.tag}** from the whitelist.`);
			}

			return message.reply(`**${user.tag}** is already whitelisted.`);
		}
		else if (remove === 'remove')
		{
			return message.reply(`**${user.tag}** is not whitelisted.`);
		}

		targetModel.type = UserTypes.WHITELISTED;
		await targetModel.save();

		return message.reply(`you added **${user.tag}** to the whitelist.`);
	}
}

export { WhitelistCommand as Command };
