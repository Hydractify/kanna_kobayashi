import { WebhookClient } from 'discord.js';

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

		if (process.env.NODE_ENV !== 'production') {
			this.setLogLevel(LogLevel.NONE);
		}
	}

	protected _write(level: LogLevel, tag: string, data: any[]): void {
		super._write(level, `Webhook][${tag}`, data);
		const cleaned: string = this._prepareText(data);

		const embed: MessageEmbed = new MessageEmbed()
			.setTimestamp()
			.setColor(colors[level][2])
			.setDescription(cleaned)
			.setFooter(
			'SHARD_ID' in process.env
				? `Shard ${process.env.SHARD_ID}`
				: 'ShardingManager',
			'https://a.safe.moe/lwS5D.png',
		);

		if (tag) embed.setTitle(tag);

		webhook.send({
			avatarURL: 'https://a.safe.moe/lwS5D.png',
			username: 'Kanna Status',
			embeds: [embed],
		});
	}
}
