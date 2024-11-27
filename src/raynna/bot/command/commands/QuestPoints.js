const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class QuestPoints {

    constructor() {
        this.name = 'QuestPoints';
        this.triggers = ['qp', 'questpoint'];
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
            const { data: player, errorMessage: message } = await getData(RequestType.Profile, name);
            if (message) {
                return message.replace('{username}', name);
            }
            if (!player) {
                return `Couldn't find player with name ${name}`;
            }
            const { questPoints } = player;
            let qp = questPoints || 0;
            if (qp >= 450) {
                qp = qp + 1;
            }
            return `${player.name}'s Quest Points: ${qp}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = QuestPoints;