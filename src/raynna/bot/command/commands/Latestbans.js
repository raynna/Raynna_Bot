const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class Latestbans {

    constructor() {
        this.name = 'Latestbans';
        this.triggers = ["lastbans"];
        this.settings = new Settings();
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const {data: list, errorMessage: message} = await getData(RequestType.ESPlayBanList);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!list || list.length === 0) {
                return `Couldn't find any bans on the list.`;
            }

            const latestBans = list.slice(0, 5);

            const bansMessage = latestBans.map((ban, index) => {
                const {user, reason} = ban;
                const {username} = user;
                return `${index + 1}. ${username}, reason: ${reason}`;
            }).join('\n');

            return `Latest bans:\n${bansMessage}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Latestbans;