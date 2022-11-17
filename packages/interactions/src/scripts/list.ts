/**
 * Standalone script that prints out all registered commands and their supported callbacks.
 */

import type { Command } from '../commands/index.js';
import * as groups from '../commands/index.js';

console.log('All available groups, with their command, and their supported callbacks.');

for (const [groupName, group] of Object.entries(groups)) {
	console.group(groupName);

	for (const [moduleName, module] of Object.entries<Command>(group)) {
		const callbacks = [
			'handleAutocomplete',
			'handleChatInput',
			'handleMessage',
			'handleMessageComponent',
			'handleModal',
			'handleUser',
		] as const;

		const supportedCallbacks = callbacks
			.filter((cbName) => module[cbName])
			.map((cbName) => cbName.slice('handle'.length))
			.join(', ');

		console.log(`${moduleName} - ${supportedCallbacks}`);
	}

	console.groupEnd();
}
