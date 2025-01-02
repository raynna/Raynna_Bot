const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class AverageExperience {

    constructor() {
        this.name = 'AverageExperience';
        this.triggers = ["averageexp", "averagexp", "avgexp", "avgxp"];
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

            const totalExperience = Object.values(skillvalues).reduce((sum, skill) => sum + Math.floor(skill.xp/10), 0);
            const skillCount = Object.keys(skillvalues).length;
            const averageExperience = (totalExperience / skillCount).toFixed(0);

            return `${name}'s average skill experience is: ${averageExperience}.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }


}

module.exports = AverageExperience;