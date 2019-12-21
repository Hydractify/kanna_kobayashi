import { User as UserModel } from '../models/User';
import { GuildMessage } from '../types/GuildMessage';
import { ICommandInfo } from '../types/ICommandInfo';
import { ICommandRunInfo } from '../types/ICommandRunInfo';
import { Command } from './Command';
import { CommandHandler } from './CommandHandler';
import { MessageEmbed } from './MessageEmbed';

export abstract class ImageEmbedCommand extends Command
{
	/**
	 * Base URL to fetch images from
	 */
	protected baseURL: string | undefined;
	/**
	 * Array of image URLS in case the default schema does not apply to the urls
	 */
	protected images: string[] | undefined;
	/**
	 * The highest number of a filename of an image
	 */
	protected maxNumber: number | undefined;
	/**
	 * The content of the sent message
	 */
	protected messageContent: string | undefined;

	/**
	 * Instantiate a new ImageEmedCommand
	 */
	protected constructor(handler: CommandHandler, options: IImageEmbedCommandInfo)
	{
		super(handler, options);

		if (options.clientPermissions) options.clientPermissions.push('EMBED_LINKS');
		else options.clientPermissions = ['EMBED_LINKS'];

		if (options.messageContent)
		{
			if (typeof options.messageContent !== 'string')
			{
				throw new TypeError(`${this.name}'s messageContent is not a string!`);
			}

			this.messageContent = options.messageContent;
		}

		if (options.baseURL)
		{
			if (typeof options.maxNumber !== 'number')
			{
				throw new TypeError(`${this.name}'s max number is not a number!`);
			}

			this.baseURL = options.baseURL;
			this.maxNumber = options.maxNumber;
		}
		else if (options.images)
		{
			if (!(options.images instanceof Array) || !options.images.length)
			{
				throw new TypeError(`${this.name}'s images is not a non emtpy Array!`);
			}

			this.images = options.images;
		}
		else
		{
			throw new Error(`${this.name} does not supply a baseURL or an images array!`);
		}
	}

	/**
	 * Default basic implementation for an image embed command.
	 * @virtual
	 */
	public run(message: GuildMessage, _: any[], { authorModel }: ICommandRunInfo): any
	{
		const embed: MessageEmbed = this.imageEmbed(message, authorModel);

		return message.channel.send(this.messageContent, embed);
	}

	/**
	 * Build an embed for this ImageEmbedCommand, will pick a random image from the pool.
	 */
	protected imageEmbed(message: GuildMessage, userModel: UserModel): MessageEmbed
	{
		let image: string;
		if (this.baseURL)
		{
			if (!this.maxNumber) throw new Error('No maxNumber set!');
			image = `${this.baseURL}${Math.floor(Math.random() * this.maxNumber) + 1}.gif`;
		}
		else
		{
			if (!this.images) throw new Error('No images set!');
			image = this.images[Math.floor(Math.random() * this.images.length)];
		}

		return MessageEmbed.image(message, userModel, image);
	}
}

export interface IImageEmbedCommandInfo extends ICommandInfo
{
	baseURL?: string;
	images?: string[];
	maxNumber?: number;
	messageContent?: string;
}
