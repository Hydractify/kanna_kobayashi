import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('hug', 'Hug someone tightly ❤');

export const handleChatInput = createChatInputHandler('hugged', Emojis.KannaShy, 'hug');
