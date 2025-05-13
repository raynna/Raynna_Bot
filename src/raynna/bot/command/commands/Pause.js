const Settings = require('../../settings/Settings');
const { getData, RequestType } = require('../../requests/Request');

class Pause {
    constructor() {
        this.moderator = true;
        this.triggers = ["pause", "resume", "pausa", "unpause", "deactivate", "activate"];
        this.name = 'Pause';
        this.settings = new Settings();
        this.game = "General";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let targetChannel = argument ? argument.trim().toLowerCase() : channel;
            targetChannel = targetChannel.startsWith('#') ? targetChannel.slice(1) : targetChannel;

            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, targetChannel);
            if (twitchError || !twitch?.data?.length) {
                return `❌ Could not find Twitch channel: ${targetChannel}`;
            }

            const twitchId = twitch.data[0].id;

            await this.settings.check(twitchId);

			const currentPaused = this.settings.savedSettings[twitchId].paused || false;
            const newPaused = !currentPaused;

			await this.settings.savePause(twitchId, newPaused);

            const action = newPaused ? 'paused 🔇' : 'resumed 🔊';
            return `✅ Bot has been ${action} on channel: ${targetChannel}`;

        } catch (error) {
            console.error(`An error occurred while executing command ${this.name}:`, error);
            return `⚠️ Something went wrong while toggling the pause mode.`;
        }
    }
}

module.exports = Pause;
