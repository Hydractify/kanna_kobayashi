/* eslint-disable new-cap */

const { BOOLEAN, DATE, ENUM, INTEGER, Model, STRING } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');
const { instance: { db: redis } } = require('../structures/Redis');
const CommandLog = require('./CommandLog');
const Item = require('./Item');
const UserItem = require('./UserItem');
const UserReputation = require('./UserReputation');

class User extends Model {
	/**
	 * Fetches a model either from redis or database.
	 * @param {string} id Id of the user to fetch
	 * @returns {Promise<User>} Model
	 */
	static async fetchOrCache(id) {
		const redisData = await redis.hgetallAsync(`users::${id}`);
		// User is cached in redis, all good
		if (redisData) return User.fromRedis(redisData);

		const [user, created] = await User.findCreateFind({ where: { id } });
		// Created users are automatically updated with a hook
		if (!created) this.updateRedis(user);
		return user;
	}

	/**
	 * Instantiates a model instance from redis data.
	 * @param {Object} data Raw data from redis
	 * @param {string} data.id Id of the user
	 * @param {number} data.coins Coins of the user
	 * @param {exp} data.exp Experience of the user
	 * @param {?string} data.type Special type of the user if any
	 * @param {?string} data.partnerId Id of the partner if any
	 * @param {?Date} data.partnerSince Since when this user in a relationship if any
	 * @param {?string} data.partnerMarried Whether the partner is married if the user is in a relationship
	 * @param {boolean} [isNewRecord=false] Whether this is a completely new user
	 * @return {User} Created model instance
	 */
	static fromRedis(data, isNewRecord = false) {
		// Not optimal but /shrug
		if (!data.type) data.type = null;
		if (!data.partnerId) data.partnerId = null;
		if (!data.partnerMarried) data.partnerMarried = null;
		if (!data.partnerSince) data.partnerSince = null;
		else data.partnerSince = new Date(Number(data.partnerSince));

		data.coins = Number(data.coins);
		data.exp = Number(data.exp);

		return new User(data, { isNewRecord });
	}

	/**
	 * Caches or updates a user instance into redis.
	 * @param {User} user To update user instance
	 */
	static updateRedis(user) {
		const data = user.toJSON();
		const nullKeys = [];

		if (data.partnerSince) data.partnerSince = data.partnerSince.getTime();

		for (const [k, v] of Object.entries(data)) {
			if (v === null) {
				delete data[k];
				nullKeys.push(k);
			}
		}

		// Nothing to delete, just one command
		if (!nullKeys.length) {
			redis.hmsetAsync(`users::${user.id}`, data);
			return;
		}

		const multi = redis.multi();
		multi.hmset(`users::${user.id}`, data);
		multi.hdel([`users::${user.id}`, ...nullKeys]);
		multi.execAsync();
	}

	/**
	 * Current level of the user
	 * @returns {number}
	 */
	get level() {
		return Math.floor(Math.sqrt(this.exp / 1000)) + 1;
	}
}

User.init(
	{
		id: {
			primaryKey: true,
			type: STRING('20')
		},
		coins: {
			allowNull: false,
			defaultValue: 0,
			type: INTEGER
		},
		exp: {
			allowNull: false,
			defaultValue: 0,
			type: INTEGER
		},
		type: {
			type: ENUM,
			values: ['BLACKLISTED', 'WHITELISTED', 'TRUSTED', 'DEV']
		},
		partnerId: {
			field: 'partner_id',
			type: STRING('20')
		},
		partnerSince: {
			field: 'partner_since',
			type: DATE
		},
		partnerMarried: {
			field: 'partner_married',
			type: BOOLEAN
		}
	},
	{
		createdAt: false,
		hooks: {
			// Keep cache up-to-date
			afterCreate: User.updateRedis,
			afterUpdate: User.updateRedis,
			afterSave: User.updateRedis,
			afterUpsert: User.updateRedis
		},
		sequelize: db,
		tableName: 'users',
		updatedAt: false
	}
);

// Partner -- camelCase FK because sequelize is very smart
// TODO: This feels very weird, make this better, no clue how. Join table for 1:1?
User.hasOne(User, { as: 'partner', foreignKey: 'partnerId' });

// Command log
User.hasMany(CommandLog, { foreignKey: 'user_id' });

// Item / Badge
User.belongsToMany(Item, {
	as: 'items',
	joinTableAttributes: ['count'],
	otherKey: 'item_id',
	through: UserItem,
	foreignKey: 'user_id',
	scope: { type: 'ITEM' }
});
User.belongsToMany(Item, {
	as: 'badges',
	joinTableAttributes: ['count'],
	otherKey: 'item_id',
	through: UserItem,
	foreignKey: 'user_id',
	scope: { type: 'BADGE' }
});
Item.belongsToMany(User, {
	as: 'holders',
	// This does not have any convenience getter atm. Will add when necessary
	joinTableAttributes: ['count'],
	otherKey: 'user_id',
	through: UserItem,
	foreignKey: 'item_id'
});

// Reputation
User.belongsToMany(User, {
	as: 'reps',
	joinTableAttributes: ['type'],
	otherKey: 'repper_id',
	through: UserReputation,
	foreignKey: 'rep_id'
});
User.belongsToMany(User, {
	as: 'repped',
	joinTableAttributes: ['type'],
	otherKey: 'rep_id',
	through: UserReputation,
	foreignKey: 'repper_id'
});

module.exports = User;
