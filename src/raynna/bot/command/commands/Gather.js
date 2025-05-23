const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const { checkBannedPlayer, getDefault} = require('../CommandUtils');

class Gather {

    constructor() {
        this.name = 'Gather';
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
            const { data: userData, errorMessage: userError } = await getData(RequestType.CS2Stats, name);
            if (userError) {
                return userError;
            }
            const { username, id } = userData;
            return await this.showGatherLobby(username, id, isBotModerator);
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
	
	async showGatherLobby(username, playerId, isBotModerator) {
    try {
        const { data: gatherList, errorMessage } = await getData(RequestType.ESPLAY_GATHERS);
        if (errorMessage) {
            return errorMessage;
        }

        let gather = null;
		let hosting = false;
        for (const g of gatherList) {
            const { data: gatherDetails, errorMessage: gatherError } = await getData(RequestType.ESPLAY_GATHER, g.id);
            if (gatherError || !gatherDetails || g.ended) continue;
			
            const isInGather = gatherDetails.users.some(user => user.id === playerId);
            if (isInGather) {
                gather = gatherDetails;
				hosting = g.host_user_id === playerId;
                break;
            }
        }

        if (gather) {
            const { picked_user_count, map_id, id } = gather;
            const waiting = gather.size - picked_user_count;

            const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
            if (globalsError) {
                return `Couldn't retrieve map data. ${globalsError}`;
            }

            const { maps } = globals;
            const map = maps.find(map => map.id === map_id);
            const mapName = map ? map.name : "Unknown Map";
            const playerLink = `https://www.esplay.com/g/${id}`;

            if (isBotModerator) {
                return `${username} is currently ${hosting ? "hosting" : "in"} a gather: ${playerLink} ${mapName}, Waiting: ${waiting}, Picked: ${picked_user_count}/10`;
            } else {
                return `${username} is currently ${hosting ? "hosting" : "in"} a gather, ${mapName}, Waiting: ${waiting}, Picked: ${picked_user_count}/10`;
            }
        }

        const { data: liveMatch, errorMessage: liveError } = await getData(RequestType.ESPLAY_CURRENT_LIVE_MATCH, playerId);
        if (liveError) {
            return liveError.replace('{id}', username);
        }

        if (liveMatch && liveMatch.match) {
            const { team, id: matchId } = liveMatch.match;
            if (!matchId) {
                return "Error finding matchId";
            }
			const bracketId = liveMatch.match.bracket_id;
			if (bracketId) {
				return `${player.username} is currently in a bracket, disabled to avoid spoilers.`;
			}

            const { data: match, errorMessage: matchError } = await getData(RequestType.ESPLAY_CURRENT_MATCH, matchId);
            if (matchError) {
                return matchError.replace('{id}', username);
            }
            if (!match) {
                return `${username} isn't currently playing ESPlay.`;
            }

            const { map_id, team1_score, team2_score, users } = match;
            const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
            if (globalsError) {
                return `Couldn't retrieve map data. ${globalsError}`;
            }

            const { maps } = globals;
            const map = maps.find(map => map.id === map_id);
            const mapName = map ? map.name : "Picking Map";

            const currentUser = users.find(u => u.id === playerId);
            const teamId = currentUser?.team;

            if (team1_score !== undefined && team2_score !== undefined && (teamId !== undefined || team !== undefined)) {
                let displayScore;

                if (teamId === 1 || team === 1) {
                    displayScore = `${team1_score} : ${team2_score}`;
                } else if (teamId === 2 || team === 2) {
                    displayScore = `${team2_score} : ${team1_score}`;
                }

                const status = (team === 1 && team1_score > team2_score) || (team === 2 && team2_score > team1_score)
                    ? "winning"
                    : team1_score === team2_score ? "tied"
                    : "losing";

                return `${username} is currently in a match on ${mapName}, ${status} with a score of ${displayScore}.`;
            }
        }

        return `${username} isn't currently in a gather or a match.`;

    } catch (error) {
        console.error(error);
        return "An unexpected error occurred while checking the lobby status.";
    }
}

}

module.exports = Gather;