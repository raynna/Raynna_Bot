require('dotenv').config();

const { OpenAI } = require("openai");

class Ask {

    constructor() {
        this.name = 'Ask';
        this.triggers = ['question', 'heybot'];
        this.game = "General";
        this.apiKey = process.env.OPENAI_KEY;
        this.conversations = {};
        this.lastActivity = {};
        this.inactivityTimeout = 2 * 60 * 1000;//2minuter resettar history om inga commands har gjorts på kanalen

        this.openai = new OpenAI({
            apiKey: this.apiKey,
        });
    }

    saveConversation(channel, username, userMessage, botResponse) {
        if (!this.conversations[channel]) {
            this.conversations[channel] = {};
        }

        if (!this.conversations[channel][username]) {
            this.conversations[channel][username] = [];
        }

        this.conversations[channel][username].push({ userMessage, botResponse });
    }

    getConversation(channel, username, maxMessages = 5) {
        const conversation = this.conversations[channel]?.[username] || [];
        return conversation.slice(-maxMessages).map(item => ({
            role: 'user',
            content: item.userMessage
        }));
    }

    resetConversationIfInactive(channel, username) {
        const currentTime = Date.now();
        const lastActivityTime = this.lastActivity[channel]?.[username];

        if (lastActivityTime && (currentTime - lastActivityTime) > this.inactivityTimeout) {
            console.log(`Resetting conversation for ${username} in ${channel} due to inactivity.`);
            this.conversations[channel][username] = [];
        }
    }

    updateLastActivity(channel, username) {
        if (!this.lastActivity[channel]) {
            this.lastActivity[channel] = {};
        }
        this.lastActivity[channel][username] = Date.now();
    }

    async execute(tags, channel, argument) {
        const username = tags.username;
        const userMessage = argument ? argument.trim() : '';

        if (!userMessage) {
            return `Please provide a question after !ask.`;
        }

        this.resetConversationIfInactive(channel, username);
        this.updateLastActivity(channel, username);

        const conversationHistory = this.getConversation(channel, username);

        try {
            const responseData = await this.openai.chat.completions.create({
                model: 'chatgpt-4o-latest',
                messages: [
                    {
                        role: 'system',
                        content: 'Respond to the user while keeping the answer under 200 characters.'
                    },
                    ...conversationHistory,
                    {
                        role: 'user',
                        content: userMessage,
                    }
                ],
                max_tokens: 40,
                temperature: 0.7,
            });

            let answer = responseData.choices[0].message.content.trim();
            this.saveConversation(channel, username, userMessage, answer);

            if (answer.length > 200) {
                answer = answer.substring(0, 200);
            }
            return `${answer}`;
        }  catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Ask;
