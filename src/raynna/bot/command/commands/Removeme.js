const { removeChannel} = require('../../utils/BotUtils');
const { updateChannels } = require('../../channels/Channels');

class Removeme {
    constructor() {
        this.name = 'Removeme';
        this.game = "General";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let result = await removeChannel(tags.username);
            await updateChannels(client);
            return result;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Removeme;
