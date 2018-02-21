import { AllowNull, Column, DataType, Model, PrimaryKey, Table, Validate } from 'sequelize-typescript';

@Table({
	createdAt: false,
	name: {
		plural: 'quizzes',
		singular: 'quiz',
	},
	tableName: 'quizzes',
	updatedAt: false,
})
export class Quiz extends Model<Quiz> {
	/**
	 * Pre made quizzes
	 */
	public static readonly preMade: {
		name: string;
		photo: string;
	}[] = [
			{
				name: 'Ilulu',
				// tslint:disable-next-line:max-line-length
				photo: 'https://vignette2.wikia.nocookie.net/maid-dragon/images/3/3d/IluluManga.png/revision/latest?cb=20170304002454',
			},
			{
				name: 'Tohru',
				photo: 'https://cdn-images-1.medium.com/max/1280/0*sh_VM38909y2PtYQ.jpg',
			},
			{
				name: 'Quetzalcoat',
				photo: 'https://myanimelist.cdn-dena.com/images/characters/4/322674.jpg',
			},
			{
				name: 'Fafnir',
				photo: 'https://i.ytimg.com/vi/CCAYUrzeGoM/maxresdefault.jpg',
			},
			{
				name: 'Elma',
				photo: 'https://i.ytimg.com/vi/lOLVU9A3fq8/maxresdefault.jpg',
			},
			{
				name: 'Kanna Kamui',
				photo: 'https://myanimelist.cdn-dena.com/images/characters/7/322911.jpg',
			},
			{
				name: 'Kobayashi',
				photo: 'https://myanimelist.cdn-dena.com/images/characters/10/317876.jpg',
			},
			{
				name: 'Makoto Takiya',
				photo: 'https://myanimelist.cdn-dena.com/images/characters/4/317870.jpg',
			},
			{
				name: 'Shouta Magatsuchi',
				photo: 'https://68.media.tumblr.com/104abedcd97ce15a51ed3238091aedff/tumblr_op4vnkjh9g1uctmvwo7_1280.png',
			},
			{
				name: 'Saikawa Riko',
				photo: 'https://myanimelist.cdn-dena.com/images/characters/8/323304.jpg',
			},
		];

	@AllowNull(false)
	@Column({
		defaultValue: 15,
		type: DataType.INTEGER,
	})
	public duration: number;

	@PrimaryKey
	@Validate({
		min: {
			args: 11,
			msg: 'guild_id must be 11 or larger!',
		},
	})
	@Column({
		field: 'guild_id',
		type: DataType.TEXT,
	})
	public readonly guildId: string;

	@Column({
		type: DataType.TEXT,
		set(this: Quiz, value: string): void {
			this.setDataValue('name', value.toLowerCase());
		},
	})
	public name: string;

	@Column
	public photo: string;
}
