const Settings = require('../../settings/Settings');
const {getData, RequestType} = require("../../requests/Request");

class Toggle {
    constructor() {
        this.moderator = true;
        this.name = 'Toggle';
        this.commands = require('../Commands').getInstance();
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            this.settings.savedSettings = await this.settings.loadSettings();
            const command = argument ? argument.toLowerCase().trim() : "";
            const allCommands = this.commands.getAllCommands();
            const formattedList = this.commands.formatCommandList(allCommands);
            if (!command) {
                return `Please provide a command, usage; -> !toggle command, commands -> ${formattedList}`;
            }
            const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (twitchError) {
                return twitchError;
            }
            const { id: twitchId } = twitch.data[0];
            await this.settings.check(twitchId);
            if (command === 'enabled') {
                const enabled = allCommands.filter(command => !this.settings.savedSettings[twitchId].toggled.includes(command.toLowerCase()));
                const formattedList = this.commands.formatCommandList(enabled);
                return `Enabled commands in ${channel} are: ${formattedList}`;
            }
            if (command === 'disabled') {
                const disabled = this.settings.savedSettings[twitchId]?.toggled || [];
                const formattedList = this.commands.formatCommandList(disabled);
                return `Disabled commands in ${channel} are: ${formattedList}`;
            }
            if (command === 'toggle') {
                return `You can't toggle this command.`;
            }
            const commandClass = this.commands.findCommandClassByTrigger(command, allCommands);
            if (commandClass) {
                const triggers = this.commands.getCommandTriggers(commandClass);
                console.log("toggle command: " + command + ", commandClass: " + commandClass + ", triggers: " + triggers);
                return this.settings.toggle(twitchId, commandClass, triggers);
            }
            return `Couldn't find any command with trigger ${command}.`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Toggle;
