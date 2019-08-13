
import { Message, TextChannel } from 'discord.js';

type NonNullProperties<T, NonNull extends keyof T> = {
	[P in NonNull]: NonNullable<T[P]>;
} & Omit<T, NonNull>;

export type GuildMessage = Omit<NonNullProperties<Message, 'guild' | 'author' | 'member'>, 'channel'>
	& { channel: TextChannel };

export const isGuildMessage = (message: any): message is GuildMessage => {
	return message.guild && message.author && message.channel instanceof TextChannel;
};
