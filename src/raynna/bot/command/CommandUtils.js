const {getData, RequestType} = require("../requests/Request");

async function getDefault(channel, argument, settings) {
    try {
        let name = argument ? argument.trim() : "";
        if (!name) {
            const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
            const {data: twitch, errorMessage: message} = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (message) {
                return {DefaultName: null, Message: message};
            }
            const {id: twitchId} = twitch.data[0];
            await settings.check(twitchId);
            name = await settings.getRunescapeName(twitchId);
        }
        if (!name) {
            return {
                DefaultName: null,
                Message: `Streamer need to register an RuneScape name -> !rsname name @${channel.slice(1)}`
            };
        }
        return {DefaultName: name, Message: ''};
    } catch (error) {
        console.error(error);
    }
}

async function getDefaultWithArgument(channel, argument, settings) {
    try {
        let name = argument ? argument.trim() : "";
        let gameType = 2;
        const argumentParts = argument ? argument.split(' ') : [];
        if (argumentParts.includes('csgo')) {
            gameType = 0;
            const nameIndex = argumentParts.indexOf('csgo');
            argumentParts.splice(nameIndex, 1);
            name = argumentParts.join(' ');
        }
        if (!name) {
            const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
            const {data: twitch, errorMessage: message} = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (message) {
                return {DefaultName: null, GameType: null, Message: message};
            }
            const {id: twitchId} = twitch.data[0];
            await settings.check(twitchId);
            name = await settings.getRunescapeName(twitchId);
        }
        if (!name) {
            return {
                DefaultName: null,
                GameType: null,
                Message: `Streamer need to register an RuneScape name -> !rsname name @${channel.slice(1)}`
            };
        }
        return {DefaultName: name, GameType: gameType, Message: ''};
    } catch (error) {
        console.error(error);
    }
}

module.exports = {getDefaultWithGameType: getDefaultWithArgument};