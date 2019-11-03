import { MessageAttachment, WebhookClient, WebhookMessageOptions } from 'discord.js';

import { colors, LogLevel } from '../types/LogLevel';
import { Logger } from './Logger';
import { MessageEmbed } from './MessageEmbed';

const { webhook: { id, secret } } = require('../../data.json');

const webhook: WebhookClient = new WebhookClient(id, secret);

export class WebhookLogger extends Logger 
{
	protected static _instance: WebhookLogger;

	public static get instance(): WebhookLogger 
	{
		return this._instance || new this();
	}

	private _webhookLevel: LogLevel = LogLevel.SILLY;

	protected _write(level: LogLevel, tag: string, data: any[]): void 
	{
		super._write(level, `Webhook][${tag}`, data);
		if (this._webhookLevel < level) return;

		let shardId: string | null = null;
		[data, shardId] = typeof data[0] === 'number'
			? [data.slice(1), `Shard ${data[0]}`]
			: data[0] === 'Manager'
				? [data.slice(1), data[0]]
				: [data, 'Global'];

		const cleaned: string = this._prepareText(data);

		const embed: MessageEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(colors[level][2])
			.setFooter(shardId);
		const options: WebhookMessageOptions = {
			avatarURL: 'https://cdn.discordapp.com/attachments/250372608284033025/494249449862725632/avatar.png',
			embeds: [embed],
			username: 'Kanna Status',
		};

		if (cleaned.length <= 2048) 
		{
			embed.setDescription(cleaned);
		}
		else 
		{
			embed.setDescription('Data is too long, falling back to file.');
			options.files = [new MessageAttachment(Buffer.from(cleaned), 'file.txt')];
		}

		if (tag) embed.setTitle(tag);

		webhook.send(options)
			// Message is still in the console
			.catch(() => undefined);
	}
}
