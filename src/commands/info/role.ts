import { Message, Role } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { MessageEmbed } from '../../structures/MessageEmbed';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';

class RoleInfoCommand extends Command {
	public constructor(handler: CommandHandler) {
		super(handler, {
			aliases: ['rr'],
			clientPermissions: ['EMBED_LINKS'],
			description: [
				'Inspect a role further',
				'Note: Avoid role mentions as this will notify all members of the role',
			].join('\n'),
			examples: ['roleinfo admin'],
			name: 'roleinfo',
			usage: 'roleinfo',
		});
	}

	public parseArgs(message: Message, [roleName]: [string]): string | [Role] {
		if (!roleName) return 'you need to give me a role name to search for.';

		const role: Role = this.resolver.resolveRole(roleName, message.guild.roles, false);

		if (!role) return `I could not find a role by that name or id ${roleName}.`;

		return [role];
	}

	public run(message: Message, [role]: [Role], { authorModel }: ICommandRunInfo): Promise<Message | Message[]> {
		const embed: MessageEmbed = MessageEmbed.common(message, authorModel)
			.setAuthor(`Information about ${role.name}`)
			.setThumbnail(message.guild.iconURL())
			.addField('Color hex', role.color ? role.hexColor : 'No Color', true)
			.addField('Displayed seperately?', `**(Hoisting)**\n${role.hoist ? 'Yes' : 'No'}`, true)
			.addField('Mentionable?', role.mentionable ? 'Yes' : 'No', true)
			.addField('Role member count', role.members.size, true);
		// Maybe add something like special permissions?

		// Twitch subscriber role or something, false for like 99% of roles
		if (role.managed) embed.addField('Is the role managed by an external application?', 'Yes', true);

		return message.channel.send(embed);
	}
}

export { RoleInfoCommand as Command };
