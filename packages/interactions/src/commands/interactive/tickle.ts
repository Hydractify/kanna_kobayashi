import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('tickle', 'Tickle someone!');

export const handleChatInput = createChatInputHandler('tickled', Emojis.KannaShy, 'tickle');
