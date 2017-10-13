const User = require('../models/User');
const Extension = require('./Extension');

class UserExtension extends Extension {
	/**
	 * Retrieves the appropriate model instance of this user from cache or from database if not cached.
	 * @returns {Promise<User>} Model instance
	 */
	fetchModel() {
		return User.fetchOrCache(this.id);
	}
}

module.exports = UserExtension;
