import { Client, ShardClientUtil, Util } from 'discord.js';
import { inspect } from 'util';
import { Loggable, AttachedLogger } from '../structures/Logger';

const broadcastEval: (script: string) => Promise<any[]> = ShardClientUtil.prototype.broadcastEval;

@Loggable('BROADCASTEVAL')
class ShardClientUtilExtension
{
	private logger!: AttachedLogger;

	public async _handleMessage(
		this: { _respond: (type: string, val: object) => void; client: any },
		message: { [key: string]: string },
	): Promise<void>
	{
		if (!message) return;
		if (message._fetchProp)
		{
			const props: string[] = message._fetchProp.split('.');
			let value: any = this.client;
			try
			{
				for (const prop of props) value = value[prop];

				// Checking for circulars; Not reassigning is intended.
				JSON.stringify(value);

				this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
			}
			catch (err)
			{
				this._respond('fetchProp', { _fetchProp: message._fetchProp, _error: Util.makePlainError(err) });
			}
		}
		else if (message._eval)
		{
			try
			{
				const _result: any = await this.client._eval(message._eval);

				// Checking for circulars; Not reassigning is intended.
				JSON.stringify(_result);

				this._respond('eval', { _eval: message._eval, _result });
			}
			catch (err)
			{
				this._respond('eval', { _eval: message._eval, _error: Util.makePlainError(err) });
			}
		}
	}

	public async broadcastEval<T, V = any>(
		fn: (client: Client, args?: V[]) => T,
		args: V[] = [],
	): Promise<T[]>
	{
		let stringified: any = fn;
		if (typeof fn !== 'string')
		{
			stringified = String(fn);

			if (/^async .* \{/.test(stringified))
			{
				stringified = `async function ${stringified.slice(5)}`;
			}
			else if (!/(^function|^\(.*\) =>)/.test(stringified))
			{
				stringified = `function ${stringified}`;
			}

			stringified = `(${stringified})(this, ${inspect(args)})`;
		}

		this.logger.debug(stringified);
		return broadcastEval.call(this, stringified);
	}
}

export { ShardClientUtilExtension as Extension };
export { ShardClientUtil as Target };
