import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('cry', 'Show how much you are sad...', 0);

export const handleChatInput = createChatInputHandler('is upset with', Emojis.KannaSad, 'cry', {
	formatAction(action, members) {
		if (members.length) {
			return action;
		}

		return action.replace(' with', '');
	},
});
