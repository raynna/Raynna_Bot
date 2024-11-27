
const Settings = require('../../settings/Settings');
const {getData, RequestType} = require('../../requests/Request');

class RSName {
    constructor() {
        this.moderator = true;
        this.name = 'RSName';
        this.triggers = ['register'];
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const name = argument ? argument.trim() : "";
            if (!name) {
                return `Please provide a username, usage; -> !rsname name`;
            }
            const { data: profile, errorMessage: error } = await getData(RequestType.Profile, name);
            if (error) {
                return error;
            }
            const { id: id, name: username } = profile;

            const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (twitchError) {
                return twitchError;
            }
            const { id: twitchId } = twitch.data[0];
            await this.settings.check(twitchId);
            if (this.settings.savedSettings.hasOwnProperty(twitchId)) {
                if (this.settings.savedSettings[twitchId].runescape.name.toLowerCase() === username.toLowerCase()) {
                    return `RuneScape Name: ${username} is already registered on this channel.`;
                }
            }
            for (const registeredChannel in this.settings.savedSettings) {
                if (this.settings.savedSettings.hasOwnProperty(registeredChannel)) {
                    const registeredSettings = this.settings.savedSettings[registeredChannel];
                    if (registeredSettings.runescape && registeredSettings.runescape.name.toLowerCase() === username.toLowerCase()) {
                        return `RuneScape Name: ${username} is already registered for channel ${this.settings.savedSettings[registeredChannel].twitch.channel}.`;
                    }
                }
            }
            await this.settings.saveRunescape(twitchId, username, id);
            return `Registered/updated RuneScape Name: ${username} for channel ${channel}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = RSName;
