class Modinfo {

    constructor() {
        this.name = 'Modinfo';
	    this.moderator = true;
        this.avoidTag = true;
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            return "Hello all Mods! If any of the commands from this bot don't fit in, you can use !toggle commandName, like for example: !toggle rank, to turn them off. To turn them back on, you would use the same command again. Have a great day!";
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Modinfo ;