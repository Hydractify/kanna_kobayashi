import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('kiss', 'K-kiss someone!');

export const handleChatInput = createChatInputHandler('kissed', Emojis.KannaBlush, 'kiss', {
	selfResponse: `H-hentai da! ${Emojis.KannaBlush}`,
});
