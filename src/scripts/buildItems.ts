import { Item } from '../models/Item';
import { Logger } from '../structures/Logger';
import { PostgreSQL } from '../structures/PostgreSQL';

import { BADGES, ITEMS } from './itemList';

PostgreSQL.instance.start().then(async () => {
	await Item.bulkCreate(ITEMS)
	.catch((error) => {
		Logger.instance.error('ERROR', error);
		process.exit(1);
	});
	Logger.instance.info('SUCESS', 'Created the items.');

	await Item.bulkCreate(BADGES)
	.catch((error) => {
		Logger.instance.error('ERROR', error);
		process.exit(1);
	});
	Logger.instance.info('SUCESS', 'Created the badges.');

	return process.exit(0);
});
