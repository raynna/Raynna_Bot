class Hugge {

    constructor() {
        this.name = 'Hugge';
        this.emote = true;
        this.avoidTag = true;
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            return "PopNemo PopNemo PopNemo";
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Hugge;