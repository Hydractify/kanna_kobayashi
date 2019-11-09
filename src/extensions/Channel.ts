import { Channel, Message } from 'discord.js';

export class ChannelExtension
{
	/* eslint-disable @typescript-eslint/no-empty-function */
	set lastMessage(value: Message)
	{ }
	set lastMessageID(value: string)
	{ }
	/* eslint-enable @typescript-eslint/no-empty-function */
}

export { ChannelExtension as Extension };
export { Channel as Target };
