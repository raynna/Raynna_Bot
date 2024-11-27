const Settings = require("../../settings/Settings");

class Users {

    constructor() {
        this.name = 'Users';
        this.avoidTag = true;
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            this.settings.savedSettings = await this.settings.loadSettings();
            const users = Object.keys(this.settings.savedSettings).length;
            return `There is currently ${users} streamers that use this bot.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Users ;