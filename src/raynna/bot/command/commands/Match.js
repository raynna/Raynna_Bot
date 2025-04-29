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
            const { cs_fields, game_stats, ban, id } = player;
			const { data: liveMatch, errorMessage: liveError } = await getData(RequestType.ESPLAY_CURRENT_LIVE_MATCH, id);
			if (liveError) {
				return liveError.replace('{id}', name);
			}
			const matchId = liveMatch.match.id;
			if (matchId == null) {
				return "error finding matchId";
			}
            const { data: match, errorMessage: matchError } = await getData(RequestType.ESPLAY_CURRENT_MATCH, matchId);
            if (matchError) {
                return matchError.replace('{id}', name);
            }
            if (!match) {
                return `${player.username} isn't currently playing ESPlay.`;
            }
            const { map_id, team1_score, team2_score, users } = match;

            const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
            if (globalsError) {
                return `Couldn't retrieve map data. ${globalsError}`;
            }

            const { maps } = globals;
            const map = maps.find(map => map.id === map_id);
            const mapName = map ? map.name : "Unknown Map";
			const currentUser = users.find(u => u.id === id);
			const teamId = currentUser?.team;
			console.log(`team1:${team1_score}, team2:${team2_score}`);
            if (team1_score !== undefined && team2_score !== undefined && teamId !== undefined) {
                let displayScore;
                if (teamId === 1) {
                    displayScore = `${team1_score} : ${team2_score}`;
                } else if (teamId === 2) {
                    displayScore = `${team2_score} : ${team1_score}`;
                }

                const status = (teamId === 1 && team1_score > team2_score) || (teamId === 2 && team2_score > team1_score)
                    ? "winning"
                    : team1_score === team2_score ? "tied"
                    : "losing";

                return `${player.username} is currently in a match on ${mapName}, ${status} with a score of ${displayScore}.`;
            }
            } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Match;