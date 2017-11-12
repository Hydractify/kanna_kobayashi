const snekfetch = require('snekfetch');

const { version } = require('../package');
const { instance: logger } = require('./Logger');

module.exports = {
	register: (name, { baseURL, bodyParams = {}, catchNotFound = true, defaultHeaders = {}, queryParams = {} } = {}) => {
		if (!defaultHeaders['User-Agent']) {
			Object.assign(defaultHeaders, {
				// eslint-disable-next-line
				'User-Agent': `Kanna-Kobayashi, a discord bot. v${version} (https://github.com/TheDragonProject/Kanna-Kobayashi)`
				// eslint-disable-next-line object-curly-newline
			});
		}

		registered.set(name, { baseURL, bodyParams, catchNotFound, defaultHeaders, name, queryParams });
		return module.exports.get(name);
	},
	get: name => {
		const options = registered.get(name);
		if (!options) throw new Error(`${name} is not registered!`);
		return new Proxy(noop, { get: getProxyHandler.bind(null, options) });
	}
};

const registered = new Map();
// eslint-disable-next-line no-empty-function
const noop = () => { };
function getProxyHandler({ baseURL, bodyParams, catchNotFound, defaultHeaders, name, queryParams }, _, firstProp) {
	let lastProperty = null;

	let base = baseURL;
	let headers = Object.assign({}, defaultHeaders);
	let data = Object.assign({}, bodyParams);
	let query = Object.assign({}, queryParams);

	const handler = {
		get(target, prop) {
			if (snekfetch.METHODS.includes(prop.toUpperCase())) {
				return (path = '') => {
					logger.debug(name.toUpperCase(), prop.toUpperCase(), base, path, query, data, headers);
					return snekfetch[prop.toLowerCase()](`${base}${path}`, { data, headers, query })
						.then(res => res.body)
						.catch(error => {
							if (catchNotFound && error.status === 404) return null;

							throw error;
						});
				};
			}

			lastProperty = prop;
			return new Proxy(noop, handler);
		},
		apply(target, thisArg, args) {
			switch (lastProperty) {
				case 'query': {
					if (args[0] === null) query = null;
					else query = Object.assign(query || {}, ...args);
					break;
				}
				case 'headers': {
					if (args[0] === null) headers = null;
					else headers = Object.assign(headers || {}, ...args);
					break;
				}
				case 'body': {
					if (args[0] === null) data = null;
					else data = Object.assign(data || {}, ...args);
					break;
				}
				case 'base': {
					[base] = args;
					break;
				}
				default: throw new TypeError(`${lastProperty} is not a function`);
			}

			return new Proxy(noop, handler);
		}
	};

	return new Proxy(noop, handler)[firstProp];
}
