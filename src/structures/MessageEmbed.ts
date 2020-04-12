import { MessageEmbed as DJSMessageEmbed, MessageEmbedOptions, User } from 'discord.js';

import { User as UserModel } from '../models/User';

export class MessageEmbed extends DJSMessageEmbed
{
	/**
	 * Build a common MessageEmbed instance from a message.
	 * This will set the color and footer.
	 */
	public static common({ author }: { author: User }, model: UserModel): MessageEmbed
	{
		return new this()
			.setColor(model.color)
			.setFooter(`Requested by ${author.tag}`, author.displayAvatarURL());
	}

	/**
	 * Build an image MessageEmbed instance, inherited properties from a common one, adds an image.
	 */
	public static image(message: { author: User }, model: UserModel, url: string): MessageEmbed
	{
		return this.common(message, model)
			.setImage(url);
	}

	/**
	 * Split up a long string into multiple fields for the embed.
	 */
	public splitToFields(title: string = '\u200b', text: string, inline: boolean = false): this
	{
		const chunks: RegExpMatchArray = text.match(/(.|[\r\n]){1,1024}/g) ?? [];

		for (const [i, chunk] of chunks.entries())
		{
			this.addField(i ? '\u200b' : title, chunk, inline);
		}

		return this;
	}

	public addBlankField(inline: boolean = false): this
	{
		return this.addField('\u200b', '\u200b', inline);
	}

	public setThumbnail(thumbnail: string | null): this
	{
		return super.setThumbnail(thumbnail!);
	}

	public setAuthor(name: any, iconURL?: string | null, url?: string): this
	{
		return super.setAuthor(name, iconURL!, url);
	}
}

// Messing with original prototype instead of the extended one because d.js internally uses their own embed class
const { _apiTransform }: { _apiTransform: () => object } = DJSMessageEmbed.prototype as any;
Object.defineProperty(DJSMessageEmbed.prototype, '_apiTransform', {
	value(this: MessageEmbed)
	{
		// It's not possible to exceed the limit without fields
		if (this.fields?.length)
		{
			let count: number = 0;
			// Max 256 chars
			if (this.title) count += this.title.length;
			// Max 2048 chars
			if (this.description) count += this.description.length;
			// Max 2048 chars
			if (this.author?.name) count += this.author.name.length;
			// Max 2048 chars, yes you read correctly
			if (this.footer?.text) count += this.footer.text.length;

			for (let i: number = 0; i < this.fields.length; ++i)
			{
				const field: { name: string; value: string } = this.fields[i];

				count += field.name.length;
				if (count >= 6000)
				{
					this.fields = this.fields.slice(0, i);
					this.fields[i - 1].value = `${this.fields[i - 1].value.slice(0, -3)}...`;
					break;
				}

				count += field.value.length;
				if (count >= 6000)
				{
					this.fields = this.fields.slice(0, i + 1);
					field.value = `${field.value.slice(0, 6000 - count - 3)}...`;
					break;
				}
			}
		}

		return _apiTransform.call(this);
	},
});
