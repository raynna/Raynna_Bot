require('dotenv').config();

const tmi = require("tmi.js");

const Commands = require('./command/Commands');
const commands = new Commands();

const {isBotModerator, addChannel, registerGame} = require('./utils/BotUtils');

const {updateChannels, connectedChannels} = require('./channels/Channels');
const {sendMessage, addLog} = require('./utils/BotUtils');

const {showRequests, getData, RequestType} = require('./requests/Request');

const client = new tmi.Client({
    connection: {
        reconnect: true,
    },
    identity: {
        username: process.env.TWITCH_BOT_USERNAME,
        password: process.env.TWITCH_OAUTH_TOKEN,
    },
});

console.log("Connecting..");
client.connect().then(async () => {
    console.log(`Connected Raynna_Bot!`);
}).catch((error) => {
    console.error(error);
});


async function reconnectBot() {
    try {
        await client.disconnect().then(async r => {
            await client.connect();
            console.log('Bot reconnected');
        })
    } catch (error) {
        console.error(error);
    }
}

const reconnectInterval = 900 * 1000; // 15 minutes
setInterval(async () => {
    await reconnectBot();
}, reconnectInterval);

const updateInterval = 30 * 1000; // 30 seconds
setInterval(() => {
    updateChannels(client).then(async r => {
        await showRequests();
    });
}, updateInterval);

client.on('connected', (address, port) => {
    try {
        setTimeout(() => {

console.log(`Bot connected with ip: ${address}:${port}`);

            updateChannels(client).then(async r => {
                await showRequests();
                //await addChannel("raynnacs");
                //console.log(`Updated channels!`);
            });
        }, 1000);
    } catch (error) {
        console.error('Error on Connected', error);
    }
});

client.on('join', (channel, username, self) => {
    try {
        const normalizedChannel = channel.startsWith('#') ? channel.replace('#', '').toLowerCase() : channel;
        if (self && !connectedChannels.includes(normalizedChannel)) {
            connectedChannels.push(normalizedChannel);
        }
    } catch (error) {
        console.error('An error occurred in the join event listener:', error);
    }
});

const regexpCommand = new RegExp(/^!([a-zA-Z0-9]+)(?:\s+)?([\s\S]*)?/);
const messageCounts = {};
const messageTimestamps = {};
const cooldowns = {};
let commandQueue = [];

client.on('message', async (channel, tags, message, self) => {
    try {
        const isNotBot = tags && tags.username && tags.username.toLowerCase() !== process.env.TWITCH_BOT_USERNAME;
        if (isNotBot) {
            if (!messageCounts[tags.username]) {
                messageCounts[tags.username] = 0;
            }

            if (!messageTimestamps[tags.username]) {
                messageTimestamps[tags.username] = Date.now();
            }

            if (!cooldowns[tags.username]) {
                cooldowns[tags.username] = {};
            }

            if (!cooldowns[tags.username][channel]) {
                cooldowns[tags.username][channel] = 0;
            }

            const currentTime = Date.now();
            const timeDifference = currentTime - messageTimestamps[tags.username];

            if (timeDifference < 30000 && messageCounts[tags.username] >= 20) {
                console.log(`Rate limit exceeded for user ${tags.username}`);
                return;
            }

            if (timeDifference >= 30000) {
                messageTimestamps[tags.username] = currentTime;
                messageCounts[tags.username] = 1;
            } else {
                messageCounts[tags.username]++;
            }
            if (message.toLowerCase().startsWith("announce")) {
                if (tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                    return;
                }
                const announcement = message.slice("announce".length).trim() || "No reason";
                for (const connected of connectedChannels) {
                    //const isModerator = await isBotModerator(client, connected);
                    //if (isModerator) {
                        await sendMessage(client, connected, `Announcement from ${tags.username}: ${announcement}`);
                    //}
                }
                return;
            }
            if (message.toLowerCase().startsWith("writeto")) {
                if (tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                    return;
                }
                const parts = message.slice("writeto".length).trim().split(" ");
                const username = parts[0];
                const streamerMessage = parts.slice(1).join(" ");
                await sendMessage(client, username, `Message from ${tags.username}: ${streamerMessage}`);
                return;
            }
            if (message.toLowerCase().startsWith("say ")) {
                const playerIsMod = tags.mod
                const isStreamer = channel.slice(1).toLowerCase() === tags.username.toLowerCase();
                const isCreator = tags.username.toLowerCase() === process.env.CREATOR_CHANNEL;
                if (!isCreator && !isStreamer && !playerIsMod) {
                    return;
                }
                const parts = message.slice("say".length).trim().split(" ");
                const streamerMessage = parts.slice(0).join(" ");
                await sendMessage(client, channel, `${streamerMessage}`);
                return;
            }
            if (message.toLowerCase().startsWith("stopbot")) {
                if (tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                    return;
                }
                const reason = message.slice("stopbot".length).trim() || "No reason";

                for (const connected of connectedChannels) {
                    const isModerator = await isBotModerator(client, connected);
                    if (isModerator) {
                        await sendMessage(client, connected, `Bot was force closed by ${tags.username}. Reason: ${reason}`);
                    }
                }
                await client.disconnect();
                process.exit(0);
                return;
            }
            if (message.toLowerCase().startsWith("restartbot")) {
                if (tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                    return;
                }
                const reason = message.slice("restartbot".length).trim() || "No reason";

                for (const connected of connectedChannels) {
                    const isModerator = await isBotModerator(client, connected);
                    if (isModerator) {
                        await sendMessage(client, connected, `Reconnecting bot by ${tags.username}. Reason: ${reason}`);
                    }
                }
                await reconnectBot();
                for (const connected of connectedChannels) {
                    const isModerator = await isBotModerator(client, connected);
                    if (isModerator) {
                        await sendMessage(client, connected, `Bot has been reconnected.`);
                    }
                }
                return;
            }
            if (message.toLowerCase().startsWith("reconnect")) {
                if (tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                    return;
                }
                const reason = message.slice("reconnect".length).trim() || "No reason";
                await sendMessage(client, channel, `Reconnecting bot..`);
                await reconnectBot();
                await sendMessage(client, channel, `Bot is now connected.`);
                return;
            }
            const match = message.match(regexpCommand);
            if (match) {
                const [, command, argument] = match;
                //const commandInstance = commandManager.commands[command.toLowerCase()];
                const commandTrigger = command.toLowerCase();
                const commandInstance = commands.commands[commandTrigger];
                if (commandInstance && typeof commandInstance.execute === 'function') {
                    try {
                        const playerIsMod = tags.mod
                        const isStreamer = channel.slice(1).toLowerCase() === tags.username.toLowerCase();
                        const isCreator = tags.username.toLowerCase() === process.env.CREATOR_CHANNEL;
			            const botIsModerator = await isBotModerator(client, channel);
                        //cooldown to avoid spammed commands from same user
                        const commandCooldown = cooldowns[tags.username][channel];
                        if (commandCooldown && currentTime - commandCooldown < 3000) {
                            console.log(`Command cooldown active for user ${tags.username}`);
                            return;
                        }
                        //avoid blocked commands by user
                        if (await commands.isBlockedCommand(commandInstance, channel)) {
                            console.log(`Command ${command} is blocked in channel ${channel}`);
                            return;
                        }
                        //avoid all commands if its not VIP/mod, exception is creator of bot.
                        if (!botIsModerator && tags.username.toLowerCase() !== process.env.CREATOR_CHANNEL.toLowerCase()) {
                            if (isStreamer) {
                                await sendMessage(client, channel, `Bot needs to be a VIP or Moderator to use commands.`);
                            }
                            return;
                        }
                        if (commands.isModeratorCommand(commandInstance)) {
                            if (!(playerIsMod || isStreamer || isCreator)) {
                                await sendMessage(client, channel, `Only the streamer or a moderator can use this command. @${tags.username}`);
                                return;
                            }
                        }
                        cooldowns[tags.username][channel] = currentTime;
                        await info(`Command execute on channel: ${channel}`, `${playerIsMod ? `Mod: ` : isStreamer ? `Streamer: ` : `Viewer: `}${tags.username} has used the command: ${command}`);
                        let result = await commandInstance.execute(tags, channel, argument, client, await isBotModerator(client, channel));
                        if (result) {
                            //console.log(`Result: ${result}`);
                            if (!commands.isAvoidTag(commandInstance)) {
                                result += ` @${tags.username}`;
                            }
                            await sendMessage(client, channel, result, commands.isEmoteCommand(commandInstance));
                            await addLog(channel, tags.username, command);
                        }
                        //console.log(`[Channel: ${channel}] ${botIsModerator ? `[Mod] ` : ``}Raynna_Bot: ${result}`);
                    } catch (e) {
                        const errorMessage = e.message || 'An error occurred while processing the command.';
                        await sendMessage(client, channel, errorMessage);
                        console.error('An error occurred in the message handler:', e);
                    }
                }
            }
        }
    } catch (error) {
        console.error('An error occurred in the message handler:', error);
    }
});

const readline = require('readline');
const {info} = require("./log/Logger");

process.on('SIGINT', async () => {
    let closingReason = false;
    closingReason = " ";
    try {
        if (!closingReason) {
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            closingReason = await new Promise(resolve => {
                rl.question('Enter reason for closing: ', answer => {
                    rl.close();
                    resolve(answer);
                });
            });
        }

        console.log(`Bot going offline, Reason: ${closingReason.trim() !== '' ? closingReason : 'No Reason'}.`);
        for (const channel of connectedChannels) {
            const isModerator = await isBotModerator(client, channel);
            if (isModerator && closingReason.trim() !== '') {
                await sendMessage(client, channel, closingReason);
            }
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
        await client.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('An error occurred during SIGINT handling:', error);
        process.exit();
    }
});