import { MessageAttachment, WebhookClient, WebhookMessageOptions } from 'discord.js';

import { colors, LogLevel } from '../types/LogLevel';
import { Logger } from './Logger';
import { MessageEmbed } from './MessageEmbed';

const { webhook: { id, secret } } = require('../../data.json');

const webhook: WebhookClient = new WebhookClient(id, secret);

export class WebhookLogger extends Logger {
	protected static _instance: WebhookLogger = undefined;

	public static get instance(): WebhookLogger {
		return this._instance || new this();
	}

	public constructor() {
		super();

		if (!process.env.NODE_ENV || process.env.NODE_ENV === 'dev') {
			this.setLogLevel(LogLevel.NONE);
		}
	}

	protected _write(level: LogLevel, tag: string, data: any[]): void {
		super._write(level, `Webhook][${tag}`, data);
		if (this._logLevel < level) return;

		const cleaned: string = this._prepareText(data);

		const embed: MessageEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(colors[level][2])
			.setFooter(
				'SHARD_ID' in process.env
					? `Shard ${process.env.SHARD_ID}`
					: 'Sharding Manager',
		);
		const options: WebhookMessageOptions = {
			avatarURL: 'https://a.safe.moe/lwS5D.png',
			embeds: [embed],
			username: 'Kanna Status',
		};

		if (cleaned.length <= 2048) {
			embed.setDescription(cleaned);
		} else {
			embed.setDescription('Data is too long, falling back to file.');
			options.files = [new MessageAttachment(Buffer.from(cleaned), 'file.txt')];
		}

		if (tag) embed.setTitle(tag);

		webhook.send(options)
			// Message is still in the console
			.catch(() => undefined);
	}
}
