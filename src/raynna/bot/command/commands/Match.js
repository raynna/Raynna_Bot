const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class Match {

    constructor() {
        this.name = 'Match';
        this.triggers = ["currentmatch"];
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
                name = await this.settings.getRunescapeName(twitchId);
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
            const { cs_fields, game_stats, ban, id } = player;

            const { data: match, errorMessage: matchError } = await getData(RequestType.ESPLAY_CURRENT_MATCH, id);
            if (matchError) {
                return matchError.replace('{username}', name);
            }
            if (!match) {
                return `${player.username} isn't currently playing ESPlay.`;
            }
            const { map_id, team, score_1, score_2 } = match;

            const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
            if (globalsError) {
                return `Couldn't retrieve map data. ${globalsError}`;
            }

            const { maps } = globals;
            const map = maps.find(map => map.id === map_id);
            const mapName = map ? map.name : "Unknown Map";

            if (score_1 !== undefined && score_2 !== undefined && team !== undefined) {
                let displayScore;
                if (team === 1) {
                    displayScore = `${score_1} : ${score_2}`;
                } else if (team === 2) {
                    displayScore = `${score_2} : ${score_1}`;
                }

                const status = (team === 1 && score_1 > score_2) || (team === 2 && score_2 > score_1)
                    ? "winning"
                    : score_1 === score_2 ? "tied"
                    : "losing";

                return `${player.username} is currently in a match on ${mapName}, ${status} with a score of ${displayScore}.`;
            }
            } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Match;