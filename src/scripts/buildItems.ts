import { Badge } from '../models/Badge';
import { Logger } from '../structures/Logger';
import { PostgreSQL } from '../structures/PostgreSQL';

import { BADGES } from './itemList';

PostgreSQL.instance.start().then(async () =>
{
	await Badge.bulkCreate(BADGES)
		.catch((error) =>
		{
			Logger.instance.error('ERROR', error);
			process.exit(1);
		});
	Logger.instance.info('SUCESS', 'Created all badges.');

	return process.exit(0);
});
