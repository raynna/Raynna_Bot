const Settings = require('../../settings/Settings');
const {getData, RequestType} = require('../../requests/Request');

class CSName {
    constructor() {
        this.moderator = true;
        this.name = 'CSName';
        this.settings = new Settings();
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const name = argument ? argument.trim() : "";

            // Check if the user provided a name
            if (!name) {
                return `Please provide a username, usage; -> !csname name`;
            }

            // Fetch the profile using the provided name
            const { data: profile, errorMessage: error } = await getData(RequestType.CS2Stats, name);
            if (error) {
                return error;
            }
            const { id, username } = profile;

            // Get Twitch user data
            const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (twitchError) {
                return twitchError;
            }
            const { id: twitchId } = twitch.data[0];
            await this.settings.check(twitchId);

            // Check if the username is already registered for this channel
            const userSettings = this.settings.savedSettings[twitchId]?.cs2?.name?.trim();
            if (userSettings === username.toLowerCase()) {
                return `Counter-Strike Name: ${username} is already registered on this channel.`;
            }

            // Check if the name is registered on another channel
            for (const registeredChannel in this.settings.savedSettings) {
                const registeredSettings = this.settings.savedSettings[registeredChannel];
                if (registeredSettings.cs2 && registeredSettings.cs2.name.toLowerCase() === username.toLowerCase()) {
                    return `Counter-Strike Name: ${username} is already registered for channel ${registeredSettings.twitch.channel}.`;
                }
            }

            // Register or update the Counter-Strike name for this channel
            await this.settings.saveCounterstrike(twitchId, username, id);
            return `Registered/updated Counter-Strike Name: ${username} for channel ${channel}`;

        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = CSName;
