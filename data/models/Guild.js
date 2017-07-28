const thinky = require('../../util/data/thinky');
const type = thinky.type;

const Guild = thinky.createModel('Guild', {
    id: type.string(),
    prefix: type.string().default('k!'),
    roles: type.object().schema({
        mod: type.string().default('Human Tamer'),
        game: type.string().default('Dragon Tamer')
    }).default({}),
    quiz: type.object().schema({
        character: type.string().default('http://pm1.narvii.com/6366/2c35594538206f7f598be792bf203b6b638e9c07_hq.jpg'),
        answer: type.string().default('Kanna Kobayashi')
    }).default({}),
    notifications: type.object().schema({
        levelUp: type.boolean().default(true),
        welcome: type.boolean().default(false)
    }).default({})
})

module.exports = Guild;
