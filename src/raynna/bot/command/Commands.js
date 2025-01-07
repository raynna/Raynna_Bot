const fs = require('fs');
const path = require('path');
const {getData, RequestType} = require("../requests/Request");
const Settings = require("../settings/Settings");

class Commands {
    constructor() {
        this.commands = {};
        this.loadCommands();
        this.settings = new Settings();
    }

    static getInstance() {
        return this;
    }

    loadCommands() {
        try {
            const commandFiles = fs.readdirSync(path.join('src/raynna/bot/command/commands/'));

            console.log('Found command files:', commandFiles);
            console.log('Command files:', commandFiles.length);
            commandFiles.forEach(file => {
                if (!file.startsWith('_')) {
                    try {
                        const CommandClass = require(`./commands/${file}`);
                        const commandInstance = new CommandClass();

                        if (typeof CommandClass === 'function') {
                            if (commandInstance.triggers && Array.isArray(commandInstance.triggers) && commandInstance.triggers.length > 0) {
                                const commandName = file.replace('.js', '').toLowerCase();
                                this.commands[commandName] = commandInstance;
                                commandInstance.triggers.forEach(trigger => {
                                    const triggerName = trigger.toLowerCase();
                                    this.commands[triggerName] = commandInstance;
                                });

                            } else {
                                const commandName = file.replace('.js', '').toLowerCase();
                                this.commands[commandName] = commandInstance;
                            }
                        } else {
                            console.error(`Error loading command from file ${file}: CommandClass is not a constructor.`);
                        }
                    } catch (error) {
                        console.error(`Error loading command from file ${file}:`, error);
                    }
                }
            });
        } catch (error) {
            console.error('Error reading command files:', error);
        }
    }

    static getValidCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));

                return { name: commandName, class: CommandClass };
            });

        const nonModeratorCommands = commands.filter(command => {
            const instance = new command.class();
            return !instance.moderator && !instance.emote && !instance.disabled;
        });

        return nonModeratorCommands.map(command => command.name);
    }


    static getAllCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));

                return { name: commandName, class: CommandClass };
            });

        const nonModeratorCommands = commands.filter(command => {
            const instance = new command.class();
            return !instance.moderator;
        });

        return nonModeratorCommands.map(command => command.name);
    }

    static getCsCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));
                const instance = new CommandClass();

                if ((instance.game === "Counter-Strike") && !instance.hasOwnProperty('moderator') && !instance.hasOwnProperty('emote')) {
                    return { name: commandName, class: CommandClass };
                }
                return null;
            }).filter(command => command !== null);

        return commands.map(command => command.name);
    }

    static getRsCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));
                const instance = new CommandClass();

                if ((instance.game === "RuneScape") && !instance.hasOwnProperty('moderator') && !instance.hasOwnProperty('emote')) {
                    return { name: commandName, class: CommandClass };
                }
                return null;
            }).filter(command => command !== null);

        return commands.map(command => command.name);
    }

    static getGeneralCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));
                const instance = new CommandClass();

                if ((instance.game === "General") && !instance.hasOwnProperty('moderator') && !instance.hasOwnProperty('emote')) {
                    return { name: commandName, class: CommandClass };
                }
                return null;
            }).filter(command => command !== null);

        return commands.map(command => command.name);
    }

    static getModeratorCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));
                const instance = new CommandClass();

                if (instance.hasOwnProperty('moderator')) {
                    return { name: commandName, class: CommandClass };
                }
                return null;
            }).filter(command => command !== null);

        return commands.map(command => command.name);
    }

    static getEmoteCommands() {
        const commandsFolder = path.join('src/raynna/bot/command/commands/');
        const commands = fs.readdirSync(commandsFolder)
            .filter(file => fs.statSync(path.join(commandsFolder, file)).isFile())
            .map(file => {
                const commandName = path.parse(file).name;
                const CommandClass = require(path.join(__dirname, '.', 'commands', file));
                const instance = new CommandClass();

                if (instance.emote) {
                    return { name: commandName, class: CommandClass };
                }

                return null;
            }).filter(command => command !== null);

        return commands.map(command => command.name);
    }



    commandExists(commandName) {
        return this.commands.hasOwnProperty(commandName);
    }

    static formatCommandList(commands) {
        const flattenedCommands = commands.flat().filter(command => typeof command === 'string');
        return flattenedCommands.length > 0
            ? flattenedCommands.map(command => `!${command.toLowerCase()}`).join(', ')
            : 'None';
    }



    static findCommandClassByTrigger(trigger, validCommands) {
        for (const command of validCommands) {
            const CommandClass = require(path.join(__dirname, '.', 'commands', command));
            const instance = new CommandClass();

            if ((instance.triggers && instance.triggers.includes(trigger)) || command.toLowerCase() === trigger) {
                return command.toLowerCase();
            }
        }
        return null;
    }

    static getCommandTriggers(commandClass) {
        const CommandClass = require(path.join(__dirname, '.', 'commands', commandClass));
        const instance = new CommandClass();
        return instance.triggers ? [commandClass, ...instance.triggers] : [commandClass];
    }


    async isBlockedCommand(commandInstance, channel) {
        this.settings.savedSettings = await this.settings.loadSettings();
        const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
        const {data: twitch, errorMessage: error} = await getData(RequestType.TwitchUser, channelWithoutHash);
        if (error) {
            console.log(error);
            return error;
        }
        if (!twitch.data || twitch.data.length === 0) {
            return `Something went from getting this twitch, no data`;
        }
        const {id: twitchId} = twitch.data[0];
        await this.settings.check(twitchId);
        const commandName = commandInstance.name?.toLowerCase();
        if (!commandName) {
            console.error('Invalid command name:', commandInstance.name);
            return false;
        }

        const toggledCommands = this.settings.savedSettings[twitchId]?.toggled || [];

        return toggledCommands.includes(commandName) || toggledCommands.includes(`!${commandName}`);
    }

    isModeratorCommand(commandInstance) {
        return commandInstance?.moderator ?? false;
    }

    isGameCommand(commandInstance, currentGame) {
        if (!commandInstance?.game && !commandInstance?.triggers) {
            return true; // If no game or triggers are specified, it's valid for any game.
        }

        if (commandInstance.game?.toLowerCase() === currentGame?.toLowerCase()) {
            return true;
        }

        if (Array.isArray(commandInstance.triggers)) {
            return commandInstance.triggers.some(trigger => {
                try {
                    const CommandClass = require(path.join(__dirname, 'commands', trigger.toLowerCase()));
                    const instance = new CommandClass();
                    return instance.game?.toLowerCase() === currentGame?.toLowerCase();
                } catch (error) {
                    console.error(`Error loading trigger "${trigger}" for game check`);
                    return false;
                }
            });
        }

        return false;
    }


    isAvoidTag(commandInstance) {
        return commandInstance?.avoidTag ?? false;
    }

    isEmoteCommand(commandInstance) {
        return commandInstance?.emote ?? false;
    }
}

module.exports = Commands;
