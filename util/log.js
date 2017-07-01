module.exports = class log {
  static bot(message) {
    console.log(`\n\x1b[45m\x1b[30m[BOT]\x1b[0m ${message}`);
  }

  static load(message) {
    console.log(`\n\x1b[43m\x1b[30m[LOAD]\x1b[0m ${message}`);
  }

  static db(message) {
    console.log(`\n\x1b[47m\x1b[30m[DB]\x1b[0m ${message}`);
  }

  static shard(message) {
    console.log(`\n\x1b[46m\x1b[30m[SHARD]\x1b[0m ${message}`);
  }
}
