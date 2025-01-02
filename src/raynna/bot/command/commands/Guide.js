class Guide {

    constructor() {
        this.name = 'Guide';
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let response = `You can add this bot to your channel by typing !addme, and !removeme to remove it from your channel. Always make sure to use /vip raynna_bot or /mod raynna_bot afterwards to make it work properly.`;
            if (isBotModerator) {
                response += ` When you added the bot a moderator och streamer can also register a name by doing command !register yourUsername`
            }
            return response;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Guide;