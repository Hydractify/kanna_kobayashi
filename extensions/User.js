const User = require('../models/User');
const Extension = require('./Extension');

class UserExtension extends Extension {
	/**
	 * Retrieves the appropriate model instance of this user from cache or from database if not cached.
	 * @returns {Promise<User>} Model instance
	 */
	async fetchModel() {
		if (this.model) return this.model;
		[this.model] = await User.findCreateFind({ where: { id: this.id } });

		return this.model;
	}
}

module.exports = UserExtension;
