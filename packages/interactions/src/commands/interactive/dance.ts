import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('dance', 'Dance', 0);

export const handleChatInput = createChatInputHandler('is dancing with', Emojis.KannaRun, 'dance', {
	formatAction(action, members) {
		if (members.length) {
			return action;
		}

		return action.replace(' with', '');
	},
});
