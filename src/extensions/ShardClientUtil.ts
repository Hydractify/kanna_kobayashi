import { Client, ShardClientUtil, Util } from 'discord.js';
import { inspect } from 'util';

const broadcastEval: (script: string) => Promise<any[]> = ShardClientUtil.prototype.broadcastEval;

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

	public async broadcastEval<T, V = any>(
		fn: (client: Client, args?: V[]) => T,
		args: V[] = [],
	): Promise<T[]> {
		let stringified: string;
		if (typeof fn === 'string') {
			stringified = fn;
		} else {
			stringified = fn.toString();

			if (!/(^function|^\(.*\) =>)/.test(stringified)) {
				stringified = `function ${stringified}`;
			}

			stringified = `(${stringified})(this, ${inspect(args)})`;
		}

		return broadcastEval.call(this, stringified);
	}
}

export { ShardClientUtilExtension as Extension };
export { ShardClientUtil as Target };
