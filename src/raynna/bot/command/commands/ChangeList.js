const { addChannel, changeChannel} = require('../../utils/BotUtils');

const {getData, RequestType} = require('../../requests/Request');

const { updateChannels } = require('../../channels/Channels');

class ChangeList {
    constructor() {
        this.developer = true;
        this.name = 'Changelist';
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            if (tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                return;
            }
            let name = argument ? argument.trim() : "";
            if (!name) {
                return await addChannel(tags.username);
            }
            const requestType = RequestType.TwitchUser;
            const { data: twitchData, errorMessage: message } = await getData(requestType, name);
            if (message) {
                if (requestType.errors.notFound) {
                    return requestType.errors.notFound;
                }
                return message;
            }
            console.log(twitchData);
            let result = await changeChannel(name);
            await updateChannels(client);
            return result;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = ChangeList;
