const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");

class CsCommand {
    constructor() {
        this.name = 'CsCommand';
        this.triggers = ["counterstrikecommands", "csgocommands", "cs2commands", "esplaycommands"];
        this.commands = require('../Commands').getInstance();
        this.settings = new Settings();
        this.game = "General";
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

            // Get Counter-Strike commands using the new method
            const csCommands = this.commands.getCsCommands();
            const enabledCommands = csCommands.filter(command =>
                !this.settings.savedSettings[twitchId]?.toggled.includes(command.toLowerCase())
            );
            // Format the Counter-Strike commands list
            const formattedList = this.commands.formatCommandList(enabledCommands);

            return `Counter-Strike Commands in ${channel.slice(1)}'s chat: -> ${formattedList}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = CsCommand;
