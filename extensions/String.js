module.exports = Reflect.defineProperty(String.prototype, 'toTitleCase', {
    value: function toTitleCase() {
        const titleCased = [];
        for (const string of this.split(' ')) {
            titleCased.push(`${string[0].toUpperCase() + string.slice(1)}`);
        }

        return titleCased.join(' ');
    }
});
