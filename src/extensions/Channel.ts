import { Channel, Message } from 'discord.js';

export class ChannelExtension {
	// tslint:disable:no-empty
	set lastMessage(value: Message) { }
	set lastMessageID(value: string) { }
	// tslint:enable:no-empty
}

export { ChannelExtension as Extension };
export { Channel as Target };
