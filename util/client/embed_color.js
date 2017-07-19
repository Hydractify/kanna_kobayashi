const colorConvert = require('color_convert');

module.exports = (message) =>
{	
	if (message)
	{	const permLevel = message.client.perms(message);
		if (permLevel === 4) return '#00000f';
		if (permLevel === 3) return '#ffffff';
	}

	return colorConvert.hsv.hex((Math.random() * 150) + 250, (Math.random() * 50) + 50, (Math.random() * 50) + 50);	};
