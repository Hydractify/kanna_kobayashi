import { GuildMember, Message, User } from 'discord.js';

import { User as UserModel } from '../../models/User';
import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { PermLevels } from '../../types/PermLevels';
import { UserTypes } from '../../types/UserTypes';

class BlacklistCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			coins: 0,
			cooldown: 0,
			description: 'Blacklists a user, disallowing them and their guilds to use the bot.',
			examples: ['blacklist @space#0302'],
			exp: 0,
			name: 'blacklist',
			permLevel: PermLevels.DEV,
			usage: 'blacklist <User> [\'remove\']',
		});
	}

	public async run(message: Message, [target, remove]: string[]): Promise<Message | Message[]> {
		// To allow nicknames, I am so sure they will be used.
		let user: User = await this.resolver.resolveMember(target, message.guild, false)
			.then((member: GuildMember) => member ? member.user : undefined);
		if (!user) user = await this.resolver.resolveUser(target, false).catch(() => undefined);
		if (!user) return message.reply(`I could not find a non-bot user by ${target}!`);

		const targetModel: UserModel = await user.fetchModel();
		if (['DEV', 'TRUSTED'].includes(targetModel.type)) {
			return message.reply('devs or trusted users can not be blacklisted. Maybe entered the wrong user?');
		}

		if (targetModel.type === UserTypes.BLACKLISTED) {
			if (remove === 'remove') {
				targetModel.type = null;
				await targetModel.save();

				return message.reply(`you removed **${user.tag}** from the blacklist.`);
			}

			return message.reply(`**${user.tag}** is already blacklisted.`);
		} else if (remove === 'remove') {
			return message.reply(`**${user.tag}** is not blacklisted.`);
		}

		targetModel.type = UserTypes.BLACKLISTED;
		await targetModel.save();

		return message.reply(`you added **${user.tag}** to the blacklist.`);
	}
}

export { BlacklistCommand as Command };
