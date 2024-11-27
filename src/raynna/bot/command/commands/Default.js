const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const { getDefaultWithGameType} = require('../CommandUtils');

class Default {

    constructor() {
        this.moderator = true;
        this.name = 'Default';
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const { DefaultName: defaultName, GameType: gameType, Message: message} = await getDefaultWithGameType(channel, argument, this.settings);
            if (message) {
                return message;
            }
            const { data: userData, errorMessage: userError } = await getData(RequestType.Profile, defaultName);
            if (userError) {
                return userError;
            }
            const { username, id, game_stats } = userData;

            return ``;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Default;