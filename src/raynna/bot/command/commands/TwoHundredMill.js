const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class TwoHundredMill {
    constructor() {
        this.name = 'TwoHundredMill';
        this.triggers = ["200ms", "200m"];
        this.settings = new Settings();
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
            const MAX_XP = 200000000;

            const skillCount = skillvalues.filter(skill => {
                  const xpThreshold = MAX_XP;
                  return skill.xp / 10 >= xpThreshold;
            }).length;

            if (skillCount === skillvalues.length) {
               return `${name} has 200m experience in all stats.`;
            }
            return `${name} has ${skillCount}/${skillvalues.length} skill${skillCount === 1 ? '' : 's'} at 200m experience.`;
        } catch (error) {
            console.error(`An error has occurred while executing command ${this.name}`, error);
            return "An unexpected error occurred while fetching skill data.";
        }
    }
}

module.exports = TwoHundredMill;
