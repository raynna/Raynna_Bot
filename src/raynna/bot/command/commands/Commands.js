const Settings = require('../../settings/Settings');
const {getData, RequestType} = require("../../requests/Request");

class Commands {
    constructor() {
        this.name = 'Commands';
        this.commands = require('../Commands').getInstance();
        this.settings = new Settings();
        this.game = "General";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            return `To show commands, use !cscommands (Counter-Strike), !rscommands (Runescape), !emotes, !general or !modcommands (For moderators only).`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Commands;
