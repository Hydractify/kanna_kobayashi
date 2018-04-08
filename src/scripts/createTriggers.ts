import { Logger } from '../structures/Logger';
import { PostgreSQL } from '../structures/PostgreSQL';

const { instance }: { instance: PostgreSQL } = PostgreSQL;

instance.start().then(() => {
	instance.db.query(`
	CREATE OR REPLACE FUNCTION user_items_remove_zeros() RETURNS TRIGGER AS
	$BODY$
	BEGIN
		IF NEW."count" <= 0 THEN
			DELETE FROM "user_items" WHERE "item_name" = NEW."item_name" AND "user_id" = NEW."user_id";
		END IF;

		RETURN NEW;
	END;
	$BODY$

	LANGUAGE plpgsql VOLATILE
	COST 100;

	DROP TRIGGER IF EXISTS user_items_count on user_items;

	CREATE TRIGGER user_items_count
		AFTER UPDATE
		ON user_items
		FOR EACH ROW
		EXECUTE PROCEDURE user_items_remove_zeros();
	`);
})
	.then(
		// Resolve
		() => {
			Logger.instance.info('SUCCESS', 'Created function and triggers');
			process.exit(0);
		},
		// Reject
		(error: Error) => {
			Logger.instance.error('ERROR', error);
			process.exit(1);
		},
);
