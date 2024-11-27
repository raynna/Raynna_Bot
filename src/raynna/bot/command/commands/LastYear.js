const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {experiencePeriods} = require("../../utils/ExperiencePeriods");

class LastYear {

    constructor() {
        this.name = 'Lastyear';
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
            const { id } = player;
            const { data: xpGains, errorMessage: xpMessage } = await getData(RequestType.XPGains, id, experiencePeriods.LAST_YEAR);
            if (xpMessage) {
                return xpMessage.replace('{username}', name);
            }
            if (!xpGains) {
                return `Couldn't find any experience data for player ${name}`;
            }
            const overall = xpGains[0];
            const { level, xp } = overall;
            return `${player.name} gained in total of ${xp} experience & ${level} levels last year.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = LastYear;