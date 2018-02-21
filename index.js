const { get } = require('snekfetch');
const { createWriteStream } = require('fs');
const { join } = require('path');

get('https://cdn.discordapp.com/avatars/130329656476827648/a_a2d8a7d932894ba8079ed10780ccf519.gif')
	.pipe(createWriteStream(join(__dirname, 'file.gif')));