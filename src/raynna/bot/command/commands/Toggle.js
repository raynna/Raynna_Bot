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
            this.settings.savedSettings = await this.settings.loadSettings();

            if (command === 'enabled') {
                const enabled = allCommands.filter(command => !this.settings.savedSettings[twitchId].toggled.includes(command.toLowerCase()));
                const formattedList = this.commands.formatCommandList(enabled);
                return `Enabled commands in ${channel} are: ${formattedList}`;
            }
            if (command === 'rs' || command === 'runescape') {
                const rsCommands = this.commands.getRsCommands();

                if (rsCommands.length === 0) {
                    return `No RuneScape commands found to toggle in ${channel}.`;
                }
                for (const trigger of rsCommands) {
                    const commandClass = this.commands.findCommandClassByTrigger(trigger.toLowerCase(), rsCommands);

                    if (!commandClass) {
                        console.error(`Command class not found for trigger: ${trigger}`);
                        return;
                    }

                    const triggers = this.commands.getCommandTriggers(commandClass);

                    if (!triggers || triggers.length === 0) {
                        console.error(`No triggers found for command class: ${commandClass}`);
                        return;
                    }

                    const isAlreadyBlocked = await this.isBlockedCommand(commandClass, twitchId);
                    if (isAlreadyBlocked) {
                        console.log(`Command ${trigger} is already toggled for channel ${channel}. Skipping.`);
                    } else {
                        await this.settings.toggle(twitchId, commandClass, triggers);
                        console.log(`Toggled ${trigger} with triggers: ${triggers} for channel ${channel}`);
                    }
                }

                return `Disabled all RuneScape commands in channel: ${channel}`;
            }
            if (command === 'cs' || command === 'counterstrike') {
                const csCommands = this.commands.getCsCommands();

                if (csCommands.length === 0) {
                    return `No Counter-Strike commands found to toggle in ${channel}.`;
                }
                for (const trigger of csCommands) {
                    const commandClass = this.commands.findCommandClassByTrigger(trigger.toLowerCase(), csCommands);

                    if (!commandClass) {
                        console.error(`Command class not found for trigger: ${trigger}`);
                        return;
                    }

                    const triggers = this.commands.getCommandTriggers(commandClass);

                    if (!triggers || triggers.length === 0) {
                        console.error(`No triggers found for command class: ${commandClass}`);
                        return;
                    }

                    const isAlreadyBlocked = await this.isBlockedCommand(commandClass, twitchId);
                    if (isAlreadyBlocked) {
                        console.log(`Command ${trigger} is already toggled for channel ${channel}. Skipping.`);
                    } else {
                        await this.settings.toggle(twitchId, commandClass, triggers);
                        console.log(`Toggled ${trigger} with triggers: ${triggers} for channel ${channel}`);
                    }
                }

                return `Disabled all Counter-Strike commands in channel: ${channel}`;
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

    async isBlockedCommand(command, twitchId) {
        const commandName = command.toLowerCase();
        const toggledCommands = this.settings.savedSettings[twitchId]?.toggled || [];
        return toggledCommands.includes(commandName) || toggledCommands.includes(`!${commandName}`);
    }
}

module.exports = Toggle;
