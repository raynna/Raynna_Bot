const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class Clues {

    constructor() {
        this.name = 'Clues';
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let username = argument ? argument.trim() : "";
            if (!username) {
                const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
                const {data: twitch, errorMessage: message} = await getData(RequestType.TwitchUser, channelWithoutHash);
                if (message) {
                    return {DefaultName: null, GameType: null, Message: message};
                }
                const {id: twitchId} = twitch.data[0];
                await this.settings.check(twitchId);
                username = await this.settings.getRunescapeName(twitchId);
            }
            if (!username) {
                return `You didn't enter a valid RuneScape username. For example 'Raynna' or 'Iron-raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.Profile, username);
            if (message) {
                return message.replace('{username}', username);
            }
            if (!player) {
                return `Couldn't find player with name ${username}`;
            }
            const { name, minigames } = player;
            if (!minigames) {
                return `Couldn't find any clue scroll data for player ${name}`;
            }
            const { easy, medium, hard, elite, master } = this.getClueIndex(minigames);
            return `${name}'s Clue Scrolls: Easy (${easy}), Medium (${medium}), Hard (${hard}), Elite (${elite}), Master (${master})`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }

    getClueIndex(minigames) {
        const { EASY_CLUE, MEDIUM_CLUE, HARD_CLUE, ELITE_CLUE, MASTER_CLUE } = minigameIndex;
        return {
            easy: minigames.clueScrollEasy?.total || 0,
            medium: minigames.clueScrollMedium?.total || 0,
            hard: minigames.clueScrollhard?.total || 0,
            elite: minigames.clueScrollElite?.total || 0,
            master: minigames.clueScrollMaster?.total || 0
        };
    }
}

module.exports = Clues;