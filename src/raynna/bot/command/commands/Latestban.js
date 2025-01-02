const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class Latestban {

    constructor() {
        this.name = 'Latestban';
        this.triggers = ["lastban"];
        this.settings = new Settings();
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const { data: list, errorMessage: message } = await getData(RequestType.ESPlayBanList);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!list) {
                return `Couldn't find any bans on the list.`;
            }
            const { user, reason } = list[0];
            const { username } = user;
            return `Latest player banned was: ${username}, reason: ${reason}!`
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Latestban;