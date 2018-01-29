import { MessageReaction, User } from 'discord.js';

export interface IResponsiveEmbedController {
	emojis: string[];
	onCollect: (messageReaction: MessageReaction, user: User) => any;
}
