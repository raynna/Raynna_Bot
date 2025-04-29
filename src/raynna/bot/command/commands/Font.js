const Settings = require('../../settings/Settings');
const { getData, RequestType } = require('../../requests/Request');
const { fontStyles } = require('../../utils/Fonts'); // Update path if needed

class Font {
    constructor() {
        this.moderator = true;
        this.triggers = ['changefont', 'style', 'textfont'];
        this.name = 'Font';
        this.settings = new Settings();
        this.game = 'General';
        this.validFonts = Object.keys(fontStyles);
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let font = argument ? argument.trim().toLowerCase() : '';

            if (!font) {
                return `Please provide a font (e.g., !font bold). Valid fonts: ${this.validFonts.join(', ')}`;
            }

            if (font === 'random') {
                font = this.validFonts[Math.floor(Math.random() * this.validFonts.length)];
            } else if (font === 'reset') {
                font = 'default';
            } else if (!this.validFonts.includes(font)) {
                return `Invalid font "${font}". Valid fonts are: ${this.validFonts.join(', ')}`;
            }

            const channelWithoutHash = channel.startsWith('#') ? channel.slice(1).toLowerCase() : channel.toLowerCase();
            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (twitchError) {
                return twitchError;
            }

            const { id: twitchId } = twitch.data[0];
            await this.settings.check(twitchId);

            await this.settings.saveFont(twitchId, font);

            return `Font for channel ${channel} has been changed to "${font}".`;

        } catch (error) {
            console.error(`An error occurred while executing command ${this.name}:`, error);
            return `Something went wrong while setting the font.`;
        }
    }
}

module.exports = Font;
