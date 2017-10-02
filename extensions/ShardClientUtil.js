const { Util } = require('discord.js');

const Extension = require('./Extension');

class ShardClientUtilExtension extends Extension {
	/**
	 * Handles an IPC message.
	 * @param {*} message Message received
	 * @private
	 */
	// Override to await the Client#_eval and to check for cirulars.
	async _handleMessage(message) {
		if (!message) return;
		if (message._fetchProp) {
			const props = message._fetchProp.split('.');
			let value = this.client;
			for (const prop of props) value = value[prop];
			this._respond('fetchProp', { _fetchProp: message._fetchProp, _result: value });
		} else if (message._eval) {
			try {
				const _result = await this.client._eval(message._eval);

				// Checking for circulars; Not reassigning is intended.
				JSON.stringify(_result);

				this._respond('eval', { _eval: message._eval, _result });
			} catch (err) {
				if (err.message === 'Converting circular structure to JSON') {
					this._respond('eval', { _eval: message._eval, _result: '<Circular-Data>' });
				} else {
					this._respond('eval', { _eval: message._eval, _error: Util.makePlainError(err) });
				}
			}
		}
	}
}

module.exports = ShardClientUtilExtension;
