const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {experiencePeriods} = require("../../utils/ExperiencePeriods");

class Yesterday {

    constructor() {
        this.name = 'Yesterday';
        this.settings = new Settings();
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
            const { data: player, errorMessage: message } = await getData(RequestType.Profile,username);
            if (message) {
                return message.replace('{username}', username);
            }
            if (!player) {
                return `Couldn't find player with name ${username}`;
            }
            const { id, name } = player;
            const { data: xpGains, errorMessage: xpMessage } = await getData(RequestType.XPGains, id, experiencePeriods.YESTERDAY);
            if (xpMessage) {
                return xpMessage.replace('{username}', name);
            }
            if (!xpGains) {
                return `Couldn't find any experience data for player ${name}`;
            }
            const overall = xpGains[0];
            const { level, xp } = overall;
            return `${name} gained in total of ${xp} experience & ${level} levels yesterday.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Yesterday;