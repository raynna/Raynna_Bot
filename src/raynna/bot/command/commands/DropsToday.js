const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {experiencePeriods} = require("../../utils/ExperiencePeriods");

class DropsToday {

    constructor() {
        this.name = 'DropsToday';
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let username = argument ? argument.trim() : "";
            if (!username) {
                const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
                const {data: twitch, errorMessage: message} = await getData(RequestType.TwitchUser, channelWithoutHash);
                if (message) {
                    return {DefaultName: null, GameType: null, Message: message};
                }
                const {id: twitchId} = twitch.data[0];
                await this.settings.check(twitchId);
                username = await this.settings.getRunescapeName(twitchId);
            }
            if (!username) {
                return `You didn't enter a valid RuneScape username. For example 'Raynna' or 'Iron-raynna'`;
            }
            const { data: player, errorMessage: message } = await getData(RequestType.Activities, username.replace(' ', "_"));
            if (message) {
                return message.replace('{username}', username);
            }
            console.log(JSON.stringify(player));
            if (!player) {
                return `Couldn't find player with name ${name}`;
            }
            if (player.error) {
                if (player.error === "PROFILE_PRIVATE") {
                    return username + "'s RuneMetrics profile is set on private.";
                }
                return "Error looking for " + username + ", reason: " + player.error;
            }
            const drops = {};
            const activities = player.activities;
            const name = player.name;
            const today = new Date().toISOString().split('T')[0];
            console.log("Today's date:", today);
            if (activities.length === 0) {
                return name + " haven't gotten any drops today.";
            }
            for (const activity of activities) {
                if (activity === null) {
                    continue;
                }
                const activityDate = new Date(activity.date).toISOString().split('T')[0];
                console.log("Activity date:", activityDate, "| Activity text:", activity.text); // Debug: Log activity date and text
                if (activityDate === today && activity.text.includes("found")) {
                    const match = activity.text.match(/found (?:a|an|some) (.+)/i);
                    if (match && match[1]) {
                        const itemName = match[1];
                        if (drops[itemName]) {
                            drops[itemName]++;
                        } else {
                            drops[itemName] = 1;
                        }
                    }
                }
            }
            let dropsSummary = name + "'s drops today: ";
            const formattedDrops = [];
            for (const [item, count] of Object.entries(drops)) {
                formattedDrops.push(`${count} x ${item}`);
            }

            if (formattedDrops.length === 0) {
                return name + " haven't gotten any drops today.";
            }
            dropsSummary += formattedDrops.join(", ");
            return dropsSummary;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = DropsToday;