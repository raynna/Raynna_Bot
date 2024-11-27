const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class Kdr {

    constructor() {
        this.name = 'Kdr';
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
                return `You didn't enter a valid ESPLAY username. For example 'Raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.CS2Stats, name);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!player) {
                return `Couldn't find player with name ${name}`;
            }
            const { cs_fields, game_stats, ban } = player;
            if (ban != null) {
               return `${player.username} is banned on Esplay, reason: ${ban.reason}.`;
            }
            if (!cs_fields) {
                return `Couldn't find any gamestats data for player ${name}`;
            }
            const kills = cs_fields.kills;
            const deaths = cs_fields.deaths;
            const ratio = deaths !== 0 ? (kills / deaths).toFixed(2) : "N/A";
            return `${player.username}'s Kdr: Kills: ${kills}, Deaths: ${deaths}, Ratio: ${ratio} with a total of ${game_stats.matches} matches.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Kdr;