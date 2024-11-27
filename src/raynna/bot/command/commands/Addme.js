const { addChannel} = require('../../utils/BotUtils');
const { updateChannels } = require('../../channels/Channels');

class Addme {
    constructor() {
        this.name = 'Addme';
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let result = await addChannel(tags.username);
            await updateChannels(client);
            return result;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Addme;
