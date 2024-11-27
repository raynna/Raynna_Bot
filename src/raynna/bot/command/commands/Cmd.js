class Cmd {

    constructor() {
        this.name = 'Commands';
        this.triggers = ["kommandon"];
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            if (!isBotModerator) {
                return `has to be a moderator to send discord invite in chat.`;
            }
            let response = `Here is all the currently working commands for the bot: `;
            response += process.env.DISCORD;
            response += process.env.COMMANDS_DISCORD;
            return response;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Cmd;