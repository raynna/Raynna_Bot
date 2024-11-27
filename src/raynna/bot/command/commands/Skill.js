const { getData, RequestType } = require("../../requests/Request");
const Settings = require("../../settings/Settings");

// Mapping of skill IDs to skill names
const SKILL_NAMES_BY_ID = {
    0: "Attack",
    1: "Defence",
    2: "Strength",
    3: "Constitution",
    4: "Ranged",
    5: "Prayer",
    6: "Magic",
    7: "Cooking",
    8: "Woodcutting",
    9: "Fletching",
    10: "Fishing",
    11: "Firemaking",
    12: "Crafting",
    13: "Smithing",
    14: "Mining",
    15: "Herblore",
    16: "Agility",
    17: "Thieving",
    18: "Slayer",
    19: "Farming",
    20: "Runecrafting",
    21: "Hunter",
    22: "Construction",
    23: "Summoning",
    24: "Dungeoneering",
    25: "Divination",
    26: "Invention",
    27: "Archaeology",
    28: "Necromancy",
};

class Skill {
    constructor() {
        this.name = 'Skill';
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let username, skillName;

            if (argument) {
                const trimmedArgument = argument.trim();
                const spaceIndex = trimmedArgument.indexOf(' ');

                if (spaceIndex !== -1) {
                    skillName = trimmedArgument.substring(0, spaceIndex);
                    username = trimmedArgument.substring(spaceIndex + 1);
                } else {
                    skillName = trimmedArgument;
                }
            }
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

            const { data: player, errorMessage: message } = await getData(RequestType.JagexProfile, username);
            if (message) {
                return message.replace('{username}', username);
            }
            if (!player) {
                return `Couldn't find any player with name ${username}`;
            }
            if (player.error) {
                if (player.error === "PROFILE_PRIVATE") {
                    return username + "'s RuneMetrics profile is set on private.";
                }
                return "Error looking for " + name + ", reason: " + player.error;
            }

            const skillValues = player.skillvalues;
            const name = player.name;
            if (skillName) {
                const skillId = Object.keys(SKILL_NAMES_BY_ID).find(
                    key => SKILL_NAMES_BY_ID[key].toLowerCase() === skillName.toLowerCase()
                );

                if (!skillId) {
                    return "You did not enter a valid RuneScape skill.";
                }

                const skill = skillValues.find(s => s.id === parseInt(skillId));
                if (!skill) {
                    return `${username} has no data available for the ${skillName} skill.`;
                }

                const { level, xp, rank } = skill;
                return `${name}'s ${skillName} level is: ${level} with ${Math.floor(xp / 10)} experience. Rank: ${rank}`;
            } else {
                return "You did not specify a skill to query.";
            }
        } catch (error) {
            console.error(`An error has occurred while executing command ${this.name}`, error);
            return "An unexpected error occurred while fetching skill data.";
        }
    }
}

module.exports = Skill;
