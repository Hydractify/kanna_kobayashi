import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('poke', "Get someone's attention!");

export const handleChatInput = createChatInputHandler('poked', Emojis.KannaBlush, 'poke');
