import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('highfive', 'High-five with someone!');

export const handleChatInput = createChatInputHandler('high-fived', Emojis.KannaRun, 'highfive');
