const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class Quests {

    constructor() {
        this.name = 'Quests';
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
                return `You didn't enter a valid RuneScape username. For example 'Raynna' or 'Iron-raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.JagexProfile, name);
            if (message) {
                return message.replace('{username}', name);
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
            const { questsstarted, questsnotstarted, questscomplete } = player;
            const totalQuests = questscomplete + questsnotstarted + questsstarted;
            if (questsstarted == 0 && questsnotstarted == 0) {
                `${player.name} has completed all ${questscomplete} quests!`;
            }
            return `${player.name} has ${questscomplete}/${totalQuests} quests completed. Started: ${questsstarted}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Quests;