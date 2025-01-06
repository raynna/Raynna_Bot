const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class Kdr {

    constructor() {
        this.name = 'Kdr';
        this.triggers = ["stats", "kd", "ratio", "krd", "elo"];
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
                return `You didn't enter a valid ESPlay username. For example 'Raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.CS2Stats, name);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!player) {
                return `Couldn't find player with name ${name} on ESPlay.`;
            }
            const { cs_fields, game_stats, ban } = player;
            if (ban != null) {
               return `${player.username} is banned on ESPlay, reason: ${ban.reason}.`;
            }
            if (!cs_fields) {
                return `Couldn't find any gamestats data for player ${name}`;
            }
            const { kills, deaths, rounds, damage_dealt } = cs_fields;
            const ratio = deaths !== 0 ? (kills / deaths).toFixed(2) : "N/A";

            const { matches, wins, losses, elo, reported } = game_stats;
            const winRatio = matches !== 0 ? ((wins / matches) * 100).toFixed(2) + "%" : "N/A";

            const avgDamagePerRound = rounds !== 0 ? (damage_dealt / rounds).toFixed(2) : "N/A";
            return `${player.username}'s: Elo: ${elo}, Kills: ${kills}, Deaths: ${deaths}, Ratio: ${ratio}, Damage/Round: ${avgDamagePerRound}, Matches: ${game_stats.matches}, Win%: ${winRatio}, Reports: ${reported}`
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Kdr;