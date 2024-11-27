class Dino {

    constructor() {
        this.name = 'Dino';
        this.emote = true;
        this.triggers = ["linnea", "l1nnea", "l1nneaaaa", "linneaz"];
        this.avoidTag = true;
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            return "DinoDance DinoDance DinoDance";
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Dino;