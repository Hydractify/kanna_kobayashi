import { Message, Role } from 'discord.js';

import { Command } from '../../structures/Command';
import { CommandHandler } from '../../structures/CommandHandler';
import { GuildMessage } from '../../types/GuildMessage';
import { ICommandRunInfo } from '../../types/ICommandRunInfo';
import { PermLevels } from '../../types/PermLevels';
import { mapIterable } from '../../util/Util';

class SelfRolesCommand extends Command
{
	public constructor(handler: CommandHandler)
	{
		super(handler, {
			aliases: ['selfrole', 'sr'],
			clientPermissions: ['MANAGE_ROLES'],
			description: [
				'Assign yourself a role, remove it or display all available ones',
				'If you are elevated you may also remove or add available roles',
			].join('\n'),
			examples: [
				'selfroles',
				'selfroles add role',
				'selfroles remove role',
				'selfroles toggle role',
				'selfrole role',
			],
			exp: 0,
			usage: 'selfrole [\'add\'|\'remove\'|\'toggle\'|Role] [Role]',
		});
	}

	public parseArgs(
		message: GuildMessage,
		[type, role]: string[],
		{ authorModel }: ICommandRunInfo,
	): string | [string, Role] | [undefined, undefined]
	{
		if (type)
		{
			type = type.toLowerCase();
			if (!['add', 'remove'].includes(type))
			{
				role = type;
				type = 'toggle';
			}
			else if (authorModel.permLevel(message.member) < PermLevels.HUMANTAMER)
			{
				return 'you do not have the required permission level to add or remove self assignable roles!';
			}

			if (!role)
			{
				return 'you should also tell me a role!';
			}

			const resolved: Role | undefined = this.resolver.resolveRole(role, message.guild.roles.cache, false);

			if (!resolved)
			{
				return `could not find a role with ${role}!`;
			}

			return [type, resolved];
		}

		return [undefined, undefined];
	}

	public async run(
		message: GuildMessage,
		[type, role]: ['add' | 'toggle' | 'remove' | undefined, Role],
	): Promise<Message | Message[] | undefined>
	{
		if (!type)
		{
			const roles: string[] = [];
			for (const roleId of message.guild.model.selfRoleIds)
			{
				const selfRole: Role | undefined = message.guild.roles.cache.get(roleId);
				// TODO: Remove from database.
				if (!selfRole) continue;
				roles.push(selfRole.toString());

			}

			if (!roles.length)
			{
				return message.reply('there are no self assignable roles set up!');
			}

			roles.unshift('self assignable roles are: ');

			return message.reply(mapIterable(roles));
		}

		if (type === 'add')
		{
			const roles: string[] = message.guild.model.selfRoleIds;
			if (roles.includes(role.id))
			{
				return message.reply(`the ${role} role is already self assignable.`);
			}

			if (message.member.roles.highest.position <= role.position)
			{
				return message.reply('you may only add roles which are positioned below your highest role!');
			}

			// A bit ugly, but sequelize really wants us to _assign_ the property
			message.guild.model.selfRoleIds = roles.concat(role.id);
			await message.guild.model.save();

			if ((message.guild.me?.roles.highest.position ?? -1) <= role.position)
			{
				return message.reply([
					`added the ${role} role to the self assignable roles!`,
					'Note: The role is not below my highest role, I can not assign or remove it!',
				].join('\n'));
			}

			return message.reply(`added the ${role} role to the self assignable roles!`);
		}

		if (type === 'remove')
		{
			const roles: string[] = message.guild.model.selfRoleIds;
			const index: number = roles.indexOf(role.id);
			if (index === -1)
			{
				return message.reply(`the ${role} role is not a self assignable.`);
			}

			roles.splice(index, 1);

			// A bit ugly, but sequelize really wants us to _assign_ the property
			message.guild.model.selfRoleIds = roles;
			await message.guild.model.save();

			return message.reply(`removed the ${role} role from the self assignable roles!`);
		}

		if (type === 'toggle')
		{
			if (!message.guild.model.selfRoleIds.includes(role.id))
			{
				return message.reply(`the ${role} role is not self assignable!`);
			}

			if ((message.guild.me?.roles.highest.position ?? -1) <= role.position)
			{
				return message.reply(`the ${role} role is self assigneable, but it is not lower than my highest role!`);
			}

			if (message.member.roles.cache.has(role.id))
			{
				await message.member.roles.remove(role, 'Requested removal of selfrole');

				return message.reply(`you no longer have the ${role} role!`);
			}
			else
			{
				await message.member.roles.add(role, 'Requestesd selfrole');

				return message.reply(`you now have the ${role} role!`);
			}
		}
	}
}

export { SelfRolesCommand as Command };
