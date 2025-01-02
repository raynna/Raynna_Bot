const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class OneTwenties {
    constructor() {
        this.name = 'OneTwenties';
        this.triggers = ["120s", "120"];
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
            const XP_FOR_120 = 104273167;
            const INVENTION_XP_FOR_120 = 80618654;

            const skillCount = skillvalues.filter(skill => {
                  const isInvention = skill.id === 26;
                  const xpThreshold = isInvention ? INVENTION_XP_FOR_120 : XP_FOR_120;
                  return skill.xp / 10 >= xpThreshold;
            }).length;

            if (skillCount === skillvalues.length) {
               return `${name} has maxed all ${skillvalues.length} stats to level 120.`;
            }
            return `${name} has ${skillCount}/${skillvalues.length} skill${skillCount === 1 ? '' : 's'} at level 120.`;
        } catch (error) {
            console.error(`An error has occurred while executing command ${this.name}`, error);
            return "An unexpected error occurred while fetching skill data.";
        }
    }
}

module.exports = OneTwenties;
