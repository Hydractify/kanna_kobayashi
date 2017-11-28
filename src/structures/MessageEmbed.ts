import { Message, MessageEmbed as DJSMessageEmbed } from 'discord.js';

import { User as UserModel } from '../models/User';

export class MessageEmbed extends DJSMessageEmbed {
	/**
	 * Build a common MessageEmbed instance from a message.
	 * This will set the color and footer.
	 */
	public static common({ author, client }: Message, model: UserModel): MessageEmbed {
		return new this()
			.setColor(model.color)
			.setFooter(`Requested by ${author.tag}`, author.displayAvatarURL());
	}

	/**
	 * Build an image MessageEmbed instance, inherited properties from a common one, adds an image.
	 */
	public static image(message: Message, model: UserModel, url: string): MessageEmbed {
		return this.common(message, model)
			.setImage(url);
	}

	/**
	 * Split up a long string into multiple fields for the embed.
	 */
	public splitToFields(text: string, title: string = '\u200b', inline: boolean = false): this {
		const chunks: RegExpMatchArray = text.match(/(.|[\r\n]){1,1024}/g);

		for (const [i, chunk] of chunks.entries()) {
			this.addField(i ? '\u200b' : title, chunk, inline);
		}

		return this;
	}
}
