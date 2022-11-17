import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('stare', 'Stare at someone');

export const handleChatInput = createChatInputHandler('is staring at', Emojis.KannaScared, 'stare');
