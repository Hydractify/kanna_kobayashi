/* eslint-disable new-cap */

const { INTEGER, STRING, Model } = require('sequelize');

const { instance: { db } } = require('../structures/PostgreSQL');

class Quiz extends Model { }

Quiz.init(
	{
		guildId: {
			field: 'guild_id',
			type: STRING('20'),
			primaryKey: true,
			validate: value => {
				if (Number(value) < 11) throw new Error('ID must be 11 or larger!');
			}
		},
		name: {
			type: STRING,
			set: function setName(value) {
				this.setDataValue('name', value.toLowerCase());
			}
		},
		photo: STRING,
		duration: {
			type: INTEGER,
			default: 15
		}
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
	{
		name: 'Ilulu',
		// eslint-disable-next-line max-len
		photo: 'https://vignette2.wikia.nocookie.net/maid-dragon/images/3/3d/IluluManga.png/revision/latest?cb=20170304002454'
	},
	{
		name: 'Tohru',
		photo: 'https://cdn-images-1.medium.com/max/1280/0*sh_VM38909y2PtYQ.jpg'
	},
	{
		name: 'Quetzalcoat',
		photo: 'https://myanimelist.cdn-dena.com/images/characters/4/322674.jpg'
	},
	{
		name: 'Fafnir',
		photo: 'https://i.ytimg.com/vi/CCAYUrzeGoM/maxresdefault.jpg'
	},
	{
		name: 'Elma',
		photo: 'https://i.ytimg.com/vi/lOLVU9A3fq8/maxresdefault.jpg'
	},
	{
		name: 'Kanna Kamui',
		photo: 'https://myanimelist.cdn-dena.com/images/characters/7/322911.jpg'
	},
	{
		name: 'Kobayashi',
		photo: 'https://myanimelist.cdn-dena.com/images/characters/10/317876.jpg'
	},
	{
		name: 'Makoto Takiya',
		photo: 'https://myanimelist.cdn-dena.com/images/characters/4/317870.jpg'
	},
	{
		name: 'Shouta Magatsuchi',
		photo: 'https://68.media.tumblr.com/104abedcd97ce15a51ed3238091aedff/tumblr_op4vnkjh9g1uctmvwo7_1280.png'
	},
	{
		name: 'Saikawa Riko',
		photo: 'https://myanimelist.cdn-dena.com/images/characters/8/323304.jpg'
	}
];

module.exports = Quiz;
