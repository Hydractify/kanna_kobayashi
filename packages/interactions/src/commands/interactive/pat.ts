import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('pat', "Pat someone's head!");

export const handleChatInput = createChatInputHandler('patted', Emojis.KannaBlush, 'pat');
