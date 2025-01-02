const { addChannel, registerGame} = require('../../utils/BotUtils');
const { updateChannels } = require('../../channels/Channels');

class RegisterGame {
    constructor() {
        this.name = 'Register Game';
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let result = await registerGame(tags.username);
            await updateChannels(client);
            return result;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = RegisterGame;
