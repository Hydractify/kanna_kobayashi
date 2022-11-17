import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('shoot', 'Shoot someone who is bothering you');

export const handleChatInput = createChatInputHandler('shot', Emojis.KannaMad, 'bang', {
	selfResponse: `Get away with that pistor or I will destroy you, human! ${Emojis.KannaMad}`,
});
