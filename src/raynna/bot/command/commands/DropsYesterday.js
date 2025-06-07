const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const { experiencePeriods } = require("../../utils/ExperiencePeriods");

class DropsYesterday {
    constructor() {
        this.name = 'DropsYesterday';
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let username = argument ? argument.trim() : "";
            if (!username) {
                const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
                const { data: twitch, errorMessage: message } = await getData(RequestType.TwitchUser, channelWithoutHash);
                if (message) {
                    return { DefaultName: null, GameType: null, Message: message };
                }
                const { id: twitchId } = twitch.data[0];
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
                return `Couldn't find any player with name ${username}`;
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

            const yesterday = new Date();
            yesterday.setUTCDate(yesterday.getUTCDate() - 1);
            const yesterdayString = yesterday.toISOString().split('T')[0];
            console.log("Yesterday's date:", yesterdayString); // Debug: Log yesterday's date

            if (activities.length === 0) {
                return name + " hasn't gotten any drops yesterday.";
            }

            for (const activity of activities) {
                if (activity === null) continue;

                const activityDate = new Date(activity.date).toISOString().split('T')[0];
                console.log("Activity date:", activityDate, "| Activity text:", activity.text); // Debug: Log activity date and text

                if (activityDate === yesterdayString && activity.text.includes("found")) {
					const match = activity.text.match(/found (?:a|an|some) (.+)/i);
                    if (match && match[1]) {
                        const itemName = match[1];
                        drops[itemName] = (drops[itemName] || 0) + 1;
                    }
                }
            }

            let dropsSummary = name + "'s drops yesterday: ";
            const formattedDrops = [];
            for (const [item, count] of Object.entries(drops)) {
                formattedDrops.push(`${count} x ${item}`);
            }

            if (formattedDrops.length === 0) {
                return name + " didn't get any drops yesterday.";
            }
            dropsSummary += formattedDrops.join(", ");
            return dropsSummary;

        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = DropsYesterday;
