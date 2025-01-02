const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class LastMatch {

    constructor() {
        this.name = 'LastMatch';
        this.triggers = ["previousmatch", "latestmatch", "latestgame", "lastgame"];
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
                return `You didn't enter a valid ESPlay username. For example 'Raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.CS2Stats, name);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!player) {
                return `Couldn't find player with name ${name} on ESPlay.`;
            }
            const { id } = player;

            const { data: match, errorMessage: matchError } = await getData(RequestType.ESPLAY_MATCHLIST, id);
            if (matchError) {
                return matchError.replace('{username}', name);
            }
            if (!match) {
                return `${player.username} haven't played any matches.`;
            }
            const { map_id, team, score_1, score_2, kills, deaths, assists } = match[0];

            const ratio = deaths !== 0 ? (kills / deaths).toFixed(2) : "N/A";

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
                    ? "won"
                    : score_1 === score_2 ? "tied"
                        : "lost";

                return `${player.username} ${status} their previous match on ${mapName} with a score of ${displayScore} with Kills: ${kills}, Deaths: ${deaths}, Assists: ${assists} and a k/d of: ${ratio}.`;
            }
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = LastMatch;