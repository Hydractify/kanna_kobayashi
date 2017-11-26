// tslint:disable:no-any

import { ShardClientUtil, Util } from 'discord.js';

class ShardClientUtilExtension {
	public async _handleMessage(this: any, message: { [key: string]: string }): Promise<void> {
		if (!message) return;
		if (message._fetchProp) {
			const props: string[] = message._fetchProp.split('.');
			let value: any = this.client;
			for (const prop of props) value = value[prop];
			this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
		} else if (message._eval) {
			try {
				const _result: any = await this.client._eval(message._eval);

				// Checking for circulars; Not reassigning is intended.
				JSON.stringify(_result);

				this._respond('eval', { _eval: message._eval, _result });
			} catch (err) {
				this._respond('eval', { _eval: message._eval, _error: Util.makePlainError(err) });
			}
		}
	}
}

export { ShardClientUtilExtension as Extension };
export { ShardClientUtil as Target };
