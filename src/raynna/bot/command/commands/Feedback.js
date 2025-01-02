const {feedback} = require("../../log/Logger");

class Feedback {

    constructor() {
        this.name = 'Feedback';
        this.triggers = [ 'idea', 'suggestion'];
        this.game = "General";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let message = argument ? argument.trim() : "";
            if (!message) {
                return `You didn't give any message for the feedback.`;
            }
            await feedback(tags.username, message.toString());
            return `${tags.username} created a feedback for bot: ${message}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Feedback;