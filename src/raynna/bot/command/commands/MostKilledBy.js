const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class MostKilledBy {

    constructor() {
        this.name = 'MostKilledBy';
        this.triggers = ["mostkilldby"];
        this.settings = new Settings();
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let name = argument ? argument.trim() : "";
            if (!name) {
                const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
                const {data: twitch, errorMessage: message} = await getData(RequestType.TwitchUser, channelWithoutHash);
                if (message) {
                    return {DefaultName: null, GameType: null, Message: message};
                }
                const {id: twitchId} = twitch.data[0];
                await this.settings.check(twitchId);
                name = await this.settings.getCounterstrikeName(twitchId);
            }
            if (!name) {
                return `You didn't enter a valid ESPLAY username. For example 'Raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.CS2Stats, name);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!player) {
                return `Couldn't find player with name ${name}`;
            }
            const { id } = player;

            const { data: mostKilled, errorMessage: error } = await getData(RequestType.ESPLAY_MOST_KILLED_BY, id);
            if (error) {
                return error.replace('{username}', name);
            }
            const { count, elo, username } = mostKilled[0];
            return `${player.username} has died to ${username} the most, ${count} times!`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = MostKilledBy;