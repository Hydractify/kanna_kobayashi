module.exports = (message) =>
{	const color_convert = require('color_convert');
	if(message)
	{	const perm = client.perms(message);
		if(perms === 4) return '#00000f';
		if(perms === 3) return '#ffffff';
	}
	return color_convert.hsv.hex(Math.random()*(350 - 250)+250, Math.random()*(100 - 50)+50, Math.random()*(100 - 50)+50);	}