import { Model as SequelizeModel } from 'sequelize-typescript';
import { inspect } from 'util';

export class Model<T extends SequelizeModel<T>> extends SequelizeModel<T>
{
	/**
	 * Custom inspect method returning the actual data values of the object to avoid unnecessary evals.
	 *
	 * Marked as optional because decorators directly reference SequelizeModel<T> which is not
	 * assignable to this class implicitly.
	 */
	/* eslint-disable-next-line @typescript-eslint/explicit-function-return-type */
	public [inspect.custom]?()
	{
		return this.dataValues;
	}
}
