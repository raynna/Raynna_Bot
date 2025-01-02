require('dotenv').config();
axios = require('axios');

const fs = require('fs');
const path = require('path');
const Settings = require('../settings/Settings');
const settings = new Settings();

const {getData, RequestType} = require('../requests/Request');
const request = require('../requests/Request');

const {getFontStyle} = require('./Fonts');

async function changeChannel(channel) {
    try {
        const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
        const {data: twitch, errorMessage: error} = await getData(RequestType.TwitchUser, channelWithoutHash);
        if (error) {
            console.log(error);
            return error;
        }
        if (!twitch.data || twitch.data.length === 0) {
            return `Something went from getting this twitch, no data`;
        }
        const {id: id, login: login, display_name: username} = twitch.data[0];
        const {data: status, errorMessage: statusError} = await getData(RequestType.StreamStatus, channelWithoutHash);
        if (statusError) {
            console.log(statusError);
            return statusError;
        }
        const { game_name } = status.data[0];
        settings.savedSettings = await settings.loadSettings();
        if (settings.savedSettings[id]) {
            await settings.remove(id);
            console.log(`Bot removed from channel: ${login} (id: ${id}).`);
            return `Bot removed from channel: ${login} (id: ${id}).`;
        }
        await settings.save(id, login, username, game_name);
        console.log(`Bot registered on channel: ${login} (id: ${id}) with game: ${game_name}.`);
        return `Bot registered on channel: ${login} (id: ${id}) with game: ${game_name}.`;
    } catch (error) {
        console.log(error);
    }
}

async function registerGame(channel) {
    try {
        const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
        const {data: twitch, errorMessage: error} = await getData(RequestType.TwitchUser, channelWithoutHash);
        if (error) {
            console.log(error);
            return error;
        }
        if (!twitch.data || twitch.data.length === 0) {
            return `Something went from getting this twitch, no data`;
        }
        const {id: id, login: login, display_name: username} = twitch.data[0];
        const {data: status, errorMessage: statusError} = await getData(RequestType.StreamStatus, channelWithoutHash);
        if (statusError) {
            console.log(statusError);
            return statusError;
        }
        const { game_name } = status.data[0];
        settings.savedSettings = await settings.loadSettings();
        await settings.registerGame(id, game_name);
        console.log(`Bot registered game: ${game_name} on: ${login} (id: ${id}).`);
        return `Bot registered game: ${game_name} on: ${login} (id: ${id}).`;
    } catch (error) {
        console.log(error);
    }
}

async function removeChannel(channel) {
    try {
        const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
        const {data: twitch, errorMessage: error} = await getData(RequestType.TwitchUser, channelWithoutHash);
        if (error) {
            console.log(error);
            return error;
        }
        if (!twitch.data || twitch.data.length === 0) {
            return `Something went from getting this twitch, no data`;
        }
        const {id: id, login: login, display_name: username} = twitch.data[0];
        settings.savedSettings = await settings.loadSettings();
        if (!settings.savedSettings[id]) {
            console.log(`Twitch channel ${login} is not registered on the bot.`);
            return `Twitch channel ${login} is not registered on the bot.`;
        }
        await settings.remove(id);
        console.log(`Bot removed from channel: ${login} (id: ${id}).`);
        return `Bot removed from channel: ${login} (id: ${id}).`;
    } catch (error) {
        console.log(error);
    }
}

async function addLog(channel, username, command) {
    try {
        const logFilePath = path.resolve(__dirname, '..', '..', '..', '..', 'commandLogs.json');
        const now = new Date();
        const todayKey = now.toISOString().split('T')[0];
        const weekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
        const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        let logData = {};
        if (fs.existsSync(logFilePath)) {
            const rawData = await fs.promises.readFile(logFilePath, 'utf-8');
            logData = JSON.parse(rawData);
        }

        const normalizedChannel = channel.startsWith('#') ? channel.slice(1).toLowerCase() : channel.toLowerCase();

        // Initialize fields if missing
        logData.totalCommands = logData.totalCommands || 0;
        logData.uniqueUserCount = logData.uniqueUserCount || 0;
        logData.mostUsedCommand = logData.mostUsedCommand || {};
        logData.mostActiveUser = logData.mostActiveUser || {};
        logData.mostActiveChannel = logData.mostActiveChannel || {};
        logData.commandsToday = logData.commandsToday || {};
        logData.commandsThisWeek = logData.commandsThisWeek || {};
        logData.commandsThisMonth = logData.commandsThisMonth || {};
        logData.userLogs = logData.userLogs || {};
        logData.channels = logData.channels || {}; // New channel data
        logData.channels[normalizedChannel] = logData.channels[normalizedChannel] || { totalCommands: 0, specificCommands: {} };

        // Increment global stats
        logData.totalCommands++;
        logData.commandsToday[todayKey] = (logData.commandsToday[todayKey] || 0) + 1;
        logData.commandsThisWeek[weekKey] = (logData.commandsThisWeek[weekKey] || 0) + 1;
        logData.commandsThisMonth[monthKey] = (logData.commandsThisMonth[monthKey] || 0) + 1;

        // Increment channel-specific stats
        logData.channels[normalizedChannel].totalCommands++;
        logData.channels[normalizedChannel].specificCommands[command] = (logData.channels[normalizedChannel].specificCommands[command] || 0) + 1;

        // Increment user-specific stats
        const isNewUser = !logData.userLogs[username];
        logData.userLogs[username] = logData.userLogs[username] || { totalCommands: 0 };
        logData.userLogs[username].totalCommands++;

        // Increment unique user count if this is a new user
        if (isNewUser) {
            logData.uniqueUserCount++;
        }

        // Validation checks
        const userCommands = Object.values(logData.userLogs).reduce((sum, user) => sum + user.totalCommands, 0);
        const channelCommands = Object.values(logData.channels).reduce((sum, channel) => sum + channel.totalCommands, 0);
        const calculatedUniqueUserCount = Object.keys(logData.userLogs).length;

        if (logData.totalCommands !== userCommands || logData.totalCommands !== channelCommands || logData.uniqueUserCount !== calculatedUniqueUserCount) {
            console.warn('Inconsistent totals detected:', {
                totalCommands: logData.totalCommands,
                userCommands,
                channelCommands,
                uniqueUserCount: logData.uniqueUserCount,
                calculatedUniqueUserCount
            });

            // Correct the totals if necessary
            logData.totalCommands = Math.max(userCommands, channelCommands);
            logData.uniqueUserCount = calculatedUniqueUserCount; // Correct the unique user count
        }

        // Find the most used command across all channels
        const allCommands = Object.entries(logData.channels).map(([key, value]) => value.specificCommands);
        const allCommandsFlattened = allCommands.reduce((acc, commands) => {
            Object.entries(commands).forEach(([cmd, count]) => {
                acc[cmd] = (acc[cmd] || 0) + count;
            });
            return acc;
        }, {});

        const mostUsedCommand = Object.entries(allCommandsFlattened).reduce((max, [cmd, count]) => count > max.count ? { command: cmd, count } : max, { command: '', count: 0 });

        const creatorChannel = process.env.CREATOR_CHANNEL.toLowerCase();
        // Find the most active user across all users
        const mostActiveUser = Object.entries(logData.userLogs)
            .filter(([user]) => user.toLowerCase() !== creatorChannel) // Exclude creator channel if matching
            .reduce((max, [user, { totalCommands }]) => totalCommands > max.totalCommands ? { user, totalCommands } : max, { user: '', totalCommands: 0 });

        // Find the most active channel
        const mostActiveChannel = Object.entries(logData.channels)
            .filter(([channel]) => channel.toLowerCase() !== creatorChannel) // Exclude creator channel if matching
            .reduce((max, [channel, { totalCommands }]) => totalCommands > max.totalCommands ? { channel, totalCommands } : max, { channel: '', totalCommands: 0 });

        // Update the most used command, most active user, and most active channel fields
        logData.mostUsedCommand = mostUsedCommand;
        logData.mostActiveUser = mostActiveUser;
        logData.mostActiveChannel = mostActiveChannel;

        // Save updated log data
        await fs.promises.writeFile(logFilePath, JSON.stringify(logData, null, 2), 'utf-8');
    } catch (error) {
        console.error(error);
    }
}





// Helper function to calculate the week number
function getWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
}



async function addChannel(channel) {
    try {
        const channelWithoutHash = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel.toLowerCase();
        const {data: twitch, errorMessage: error} = await getData(RequestType.TwitchUser, channelWithoutHash);
        if (error) {
            console.log(error);
            return error;
        }
        if (!twitch.data || twitch.data.length === 0) {
            return `Something went from getting this twitch, no data`;
        }
        const {id: id, login: login, display_name: username} = twitch.data[0];
        const {data: status, errorMessage: statusError} = await getData(RequestType.StreamStatus, channelWithoutHash);
        if (statusError) {
            console.log(statusError);
            return statusError;
        }
        const { game_name } = status.data[0];
        settings.savedSettings = await settings.loadSettings();
        if (settings.savedSettings[id] && settings.savedSettings[id].twitch.channel) {
            console.log(`Twitch channel ${settings.savedSettings[id].twitch.channel} is already registered on the bot.`);
            return `Twitch channel ${settings.savedSettings[id].twitch.channel} is already registered on the bot.`;
        }
        await settings.save(id, login, username, game_name);
        console.log(`Bot registered on channel: ${login} (id: ${id}) with game: ${game_name}.`);
        return `Bot registered on channel: ${login} (id: ${id}) with game: ${game_name}.`;
    } catch (error) {
        console.log(error);
    }
}

async function isBotModerator(client, channel) {
    try {
        return client.isMod(channel, process.env.TWITCH_BOT_USERNAME) || client.isVip(channel, process.env.TWITCH_BOT_USERNAME);
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

async function changeFont(text, channel) {
    try {
        text = text.toString();
        const styleMap = await getFontStyle(channel, settings);
        let isLink = false;
        let isTag = false;
        let isEmote = false;
        let emotes = ["DinoDance", "Kappa", "TwitchConHYPE", "damang4Zoom"];
        return text.split('').map((char, index) => {
            if (text.length - 1 === index && (char === ' ' || char === '\n')) {
                return '';
            } else if ((char === ' ' || char === '\t' || char === '\n') && (isLink || isTag)) {
                isLink = false;
                isTag = false;
                isEmote = false;
            } else if (text.substring(index).startsWith('https://') && !isLink) {
                isLink = true;
            } else if (emotes.some(emote => text.substring(index).startsWith(emote))) {
                isEmote = true;
            } else if (char === '@' && !isLink) {
                isTag = true;
            }
            return (isLink || isTag || isEmote) ? char : (styleMap[char] || char);
        }).join('');
    } catch (error) {
        console.log(error);
    }
}

let lastMessageTime = 0;
let messageCount = 0;

async function sendMessage(client, channel, message, skipFont = false) {
    try {
        const currentTime = Date.now();
        const timeElapsed = currentTime - lastMessageTime;

        const isMod = await isBotModerator(client, channel);
        const rateLimit = (channel.includes(process.env.CREATOR_CHANNEL) || isMod) ? 100 : 20;

        if (timeElapsed < 30000 && messageCount === rateLimit) {
            console.log("Bot reached rateLimit");
            return;
        }
        if (timeElapsed >= 30000) {
            messageCount = 1;
        } else {
            messageCount++;
        }
        lastMessageTime = currentTime;
        if (message) {
            console.log(`[Channel: ${channel}]`, `[Raynna_Bot]`, message);

            let formattedMessage = message;
            // Regular expression to find numbers greater than 10,000 preceded by a space
            const regex = /(?<=\s)(\d{5,})/g;
            formattedMessage = formattedMessage.replace(regex, (match, p1) => {
                return p1.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            });

            if (skipFont) {
                await client.say(channel, message);
            } else {
                await client.say(channel, await changeFont(formattedMessage, channel));
            }
        }
    } catch (error) {
        console.error(error);
    }
}


/**Data for a twitch channel
 *
 * Settings for channel #daman_gg: {"id":-1,"toggled":{},"esportal":{"name":"test","id":75317132}}
 * data for channel #daman_gg: [{"id":"41837700776","user_id":"62489635","user_login":"daman_gg","user_name":"DaMan_gg","game_id":"32399","game_name":"Counter-Str
 * ike","type":"live","title":"GIBB MED DAGANG | GIVEAWAYS","viewer_count":42,"started_at":"2024-02-06T08:06:39Z","language":"sv","thumbnail_url":"https://static-
 * cdn.jtvnw.net/previews-ttv/live_user_daman_gg-{width}x{height}.jpg","tag_ids":[],"tags":["swe","Svenska","DaddyGamer","everyone","eng","English","counterstrike","esportal"],"is_mature":false}], length: 1
 */

//checks if there is any data to gather, if not, stream is offline and returns false
async function isStreamOnline(channel) {
    try {
        const {
            data: streamData,
            errorMessage: message
        } = await request.getData(request.RequestType.StreamStatus, channel);
        if (message) {
            return false;
        }
        if (streamData.data && streamData.data.length > 0) {
            const {user_id: twitchId} = streamData.data[0];
            if (settings[twitchId]) {
                await settings.check(twitchId);
            }
        }
        return streamData.data && streamData.data.length > 0;
    } catch (error) {
        console.log(error);
    }
}

function isCreatorChannel(channel) {
    return channel.toLowerCase().replace(/#/g, '') === process.env.CREATOR_CHANNEL;
}

module.exports = {
    isCreatorChannel,
    isStreamOnline,
    sendMessage,
    addChannel,
    removeChannel,
    changeChannel,
    isBotModerator,
    registerGame,
    addLog
}