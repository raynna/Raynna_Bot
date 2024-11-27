const Settings = require('../../settings/Settings');
const {getData, RequestType} = require("../../requests/Request");

class Commands {
    constructor() {
        this.name = 'Commands';
        this.commands = require('../Commands').getInstance();
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            this.settings.savedSettings = await this.settings.loadSettings();
            const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (twitchError) {
                return twitchError;
            }
            const { id: twitchId } = twitch.data[0];
            await this.settings.check(twitchId);
            const validCommands = this.commands.getValidCommands();
            const enabled = validCommands.filter(command => !this.settings.savedSettings[twitchId].toggled.includes(command.toLowerCase()));
            const formattedList = this.commands.formatCommandList(enabled);
            return `Commands in ${channel.slice(1)}'s chat: -> ${formattedList}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Commands;
