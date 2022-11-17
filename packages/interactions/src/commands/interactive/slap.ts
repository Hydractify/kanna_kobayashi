import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('slap', 'Punch someone!');

export const handleChatInput = createChatInputHandler('slapped', Emojis.KannaScared, 'slap', {
	selfResponse: `You can not slap me! ${Emojis.KannaMad}`,
});
