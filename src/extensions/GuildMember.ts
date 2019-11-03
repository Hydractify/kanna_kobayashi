import { GuildMember, Message } from 'discord.js';

export class GuildMemberExtension 
{
	// tslint:disable:no-empty
	set lastMessage(value: Message) 
	{ }
	set lastMessageID(value: string) 
	{ }
	// tslint:enable:no-empty
}

export { GuildMemberExtension as Extension };
export { GuildMember as Target };
