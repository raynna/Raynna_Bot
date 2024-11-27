const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class EasyRank {

    constructor() {
        this.name = 'EasyRank';
        this.settings = new Settings();
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
                name = await this.settings.getRunescapeName(twitchId);
            }
            if (!name) {
                return `You didn't enter a valid RuneScape username. For example 'Raynna' or 'Iron-raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.Profile, name);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!player) {
                return `Couldn't find player with name ${name}`;
            }
            const { minigames } = player;
            if (!minigames) {
                return `Couldn't find any clue scroll data for player ${name}`;
            }
            const easy = minigames.clueScrollEasy;
            const { total, rank } = easy;
            return `${player.name}'s Easy clue scrolls: ${total}, rank: ${rank}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = EasyRank;