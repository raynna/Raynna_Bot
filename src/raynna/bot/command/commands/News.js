const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");

class News {

    constructor() {
        this.name = 'News';
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const { data: news, errorMessage: message } = await getData(RequestType.News);
            if (message) {
                return message;
            }
            if (!news) {
                return `Couldn't find any news`;
            }
            return `Latest RuneScape News: ${news.title}, ${news.url}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = News;