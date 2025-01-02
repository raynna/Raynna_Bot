const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class NintyNines {
    constructor() {
        this.name = 'NintyNines';
        this.triggers = ["99s", "99"];
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let username;

            if (argument) {
                username = argument.trim();
            }

            if (!username) {
                const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
                const { data: twitch, errorMessage: message } = await getData(RequestType.TwitchUser, channelWithoutHash);
                if (message) {
                    return { DefaultName: null, GameType: null, Message: message };
                }
                const { id: twitchId } = twitch.data[0];
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
             const skillValues = player.skillvalues;
             const maxLevel = 99;
             const skillCount = skillValues.filter(skill => skill.level >= maxLevel).length;
             if (skillCount == skillValues.length) {
                return `${name} has maxed all ${skillValues.length} stats ${maxLevel} or above.`;
             }
             return `${name} has ${skillCount}/${skillValues.length} skill${skillCount === 1 ? '' : 's'} at level ${maxLevel}.`;
        } catch (error) {
            console.error(`An error has occurred while executing command ${this.name}`, error);
            return "An unexpected error occurred while fetching skill data.";
        }
    }
}

module.exports = NintyNines;
