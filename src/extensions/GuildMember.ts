import { GuildMember, Message } from 'discord.js';

export class GuildMemberExtension
{
	/* eslint-disable @typescript-eslint/no-empty-function */
	set lastMessage(value: Message)
	{ }
	set lastMessageID(value: string)
	{ }
	/* eslint-enable @typescript-eslint/no-empty-function */
}

export { GuildMemberExtension as Extension };
export { GuildMember as Target };
