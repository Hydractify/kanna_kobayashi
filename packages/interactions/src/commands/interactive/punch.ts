import { Emojis } from '../../emojis.js';
import { createChatInputHandler, createData } from './base.js';

export const data = createData('punch', 'Punch someone!');

export const handleChatInput = createChatInputHandler('punched', Emojis.KannaScared, 'punch', {
	selfResponse: `you can not punch me! ${Emojis.KannaMad}`,
});
