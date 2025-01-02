const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class AverageLevel {

    constructor() {
        this.name = 'AverageLevel';
        this.triggers = ["avglvl", "avglevel", "averagelvl", "averageskills"];
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

            const { data: player, errorMessage: message } = await getData(RequestType.JagexProfile, username);
            if (message) {
                return message.replace('{username}', username);
            }
            if (!player) {
                return `Couldn't find any player with name ${username}`;
            }
            if (player.error) {
                if (player.error === "PROFILE_PRIVATE") {
                    return username + "'s RuneMetrics profile is set on private.";
                }
                return "Error looking for " + name + ", reason: " + player.error;
            }
            const { name, skillvalues } = player;

            if (!skillvalues) {
                return `No skills data found for player ${username}.`;
            }

            const totalLevels = Object.values(skillvalues).reduce((sum, skill) => sum + skill.level, 0);
            const skillCount = Object.keys(skillvalues).length;
            const averageLevel = (totalLevels / skillCount).toFixed(2);

            return `${name}'s average skill level is: ${averageLevel}.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }


}

module.exports = AverageLevel;