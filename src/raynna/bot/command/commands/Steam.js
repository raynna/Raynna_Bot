const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {getDefault} = require("../CommandUtils");

class Steam {

    constructor() {
        this.name = 'Steam';
        this.settings = new Settings();
        this.game = "Counter-Strike";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let name = argument ? argument.trim() : "";
            if (!name) {
                const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
                const {data: twitch, errorMessage: message} = await getData(RequestType.TwitchUser, channelWithoutHash);
                if (message) {
                    return {DefaultName: null, GameType: null, Message: message};
                }
                const {id: twitchId} = twitch.data[0];
                await this.settings.check(twitchId);
                name = await this.settings.getRunescapeName(twitchId);
            }
            if (!name) {
                return `You didn't enter a valid ESPLAY username. For example 'Raynna'`;
            }
            const { data: player, errorMessage: error } = await getData(RequestType.CS2Stats, name);
            if (error ) {
                return error;
            }
            //76561198024747940 - correct steamid
            //64482212 -          steamid inside api
            //3006037612 -        id inside api
            const { username, id, steamid } = player;
            const convertedSteamId = BigInt("76561197960265728") + BigInt(steamid);

            console.log(`Esplay profile: https://esportal.com/sv/profile/${username}`);
            console.log(`Steam profile: https://steamcommunity.com/profiles/${convertedSteamId}`);
            let response = `${username}'s `;
            if (isBotModerator) {
                response += `Steam: https://www.steamcommunity.com/profiles/${convertedSteamId}`;
            } else {
                response += `SteamId: ${convertedSteamId}`;
            }
            return response;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Steam;