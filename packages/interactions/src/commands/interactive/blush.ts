import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('blush', 'S-show how embarrassed you are!', 0);

export const handleChatInput = createChatInputHandler('is blushing because of', Emojis.KannaShy, 'blush', {
	formatAction(action, members) {
		if (members.length) {
			return action;
		}

		return action.replace(' because of', '');
	},
});
