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
            const { data: gatherList, errorMessage: errorMessage } = await getData(RequestType.ESPLAY_GATHERS);
            if (errorMessage) {
                return errorMessage;
            }
            const gather = gatherList.find(gather => gather.host.id === playerId);
            if (!gather) {
                return `${username} isn't currently hosting a gather.`;
            }

            const { picked_user_count, map_id, id, match_id } = gather;
            const waiting = gather.size - picked_user_count;
            const { data: globals, errorMessage: globalsError } = await getData(RequestType.ESPLAY_GLOBALS);
            if (globalsError) {
                return `Couldn't retrieve map data. ${globalsError}`;
            }

            const { maps } = globals;
            const map = maps.find(map => map.id === map_id);
            const mapName = map ? map.name : "Unknown Map";

            // Check if the player ID is in the gather list
            const playerLink = `https://www.esplay.com/g/${id}`;
            const { data: match, errorMessage: matchError } = await getData(RequestType.ESPLAY_CURRENT_MATCH, playerId);
            if (matchError) {
                return matchError;
            }
            if (match) {
                const { team, score_1, score_2 } = match;


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

                    return `${username} is currently in a match on ${mapName}, ${status} with a score of ${displayScore}.`;
                }
            } else {
                if (isBotModerator) {
                    return `${username} is currently hosting a gather: ${playerLink} ${mapName}, Waiting: ${waiting}, Picked: ${picked_user_count}/10`;
                }
                return `${username} is currently hosting a gather, ${mapName}, Waiting: ${waiting}, Picked: ${picked_user_count}/10`;
            }
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Gather;