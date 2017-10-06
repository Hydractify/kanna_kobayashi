/* eslint-disable new-cap */

const { cast, col, Op: { between }, STRING, Model, where } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class Quiz extends Model {
	// Insert default values if not already
	static async sync(...args) {
		await super.sync(...args);

		const already = await this.count({
			// Not-escape column name -> cast column string to integer -> where that int is 0-10
			where: where(cast(col('quiz_id'), 'integer'), { [between]: [0, 10] })
		});
		if (already === 10) return undefined;

		return this.bulkCreate(
			Quiz.preMade.map(
				([name, photo], index) => ({
					quizId: String(index),
					name,
					photo
				})
			)
		);
	}

	get preMade() {
		return Number(this.id) < 10;
	}
}

Quiz.init(
	{
		// 1-10 (as strings) are pre made quizes, others are the guild ids
		quizId: {
			field: 'quiz_id',
			type: STRING('20'),
			primaryKey: true
		},
		name: {
			type: STRING,
			set: function setName(value) {
				this.setDataValue('name', value.toLowerCase());
			}
		},
		photo: STRING
	},
	{
		createdAt: false,
		name: {
			singular: 'quiz',
			plural: 'quizzes'
		},
		sequelize: db,
		tableName: 'quizzes',
		updatedAt: false
	}
);

Quiz.preMade = [
	[
		'Ilulu',
		'https://vignette2.wikia.nocookie.net/maid-dragon/images/3/3d/IluluManga.png/revision/latest?cb=20170304002454'
	],
	[
		'Tohru',
		'https://cdn-images-1.medium.com/max/1280/0*sh_VM38909y2PtYQ.jpg'
	],
	[
		'Quetzalcoat',
		'https://myanimelist.cdn-dena.com/images/characters/4/322674.jpg'
	],
	[
		'Fafnir',
		'https://i.ytimg.com/vi/CCAYUrzeGoM/maxresdefault.jpg'
	],
	[
		'Elma',
		'https://i.ytimg.com/vi/lOLVU9A3fq8/maxresdefault.jpg'
	],
	[
		'Kanna Kamui',
		'https://myanimelist.cdn-dena.com/images/characters/7/322911.jpg'
	],
	[
		'Kobayashi',
		'https://myanimelist.cdn-dena.com/images/characters/10/317876.jpg'
	],
	[
		'Makoto Takiya',
		'https://myanimelist.cdn-dena.com/images/characters/4/317870.jpg'
	],
	[
		'Shouta Magatsuchi',
		'https://68.media.tumblr.com/104abedcd97ce15a51ed3238091aedff/tumblr_op4vnkjh9g1uctmvwo7_1280.png'
	],
	[
		'Saikawa Riko',
		'https://myanimelist.cdn-dena.com/images/characters/8/323304.jpg'
	]
];

module.exports = Quiz;
