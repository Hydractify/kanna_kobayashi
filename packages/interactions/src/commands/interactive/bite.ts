import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('bite', 'Bite someone!');

export const handleChatInput = createChatInputHandler('bit', Emojis.KannaShy, 'bite');
