import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('lick', 'L-lick someone!');

export const handleChatInput = createChatInputHandler('licked', Emojis.KannaBlush, 'lick', {
	selfResponse: 'do not even dare to do that!',
});
