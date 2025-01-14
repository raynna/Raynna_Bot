const Settings = require('../settings/Settings');
const settings = new Settings();

const botUtils = require('../utils/BotUtils');

const { info } = require('../log/Logger');
const {get} = require("axios");

let connectedChannels = [];

async function updateChannels(client) {
    try {
        settings.savedSettings = await settings.loadSettings();
        const channelsToJoin = new Set();
        const channelsToLeave = new Set();
        let hasChanges = false;

        await Promise.all(connectedChannels.map(async (channel) => {
            try {
                const channelExists = Object.values(settings.savedSettings).some(entry => entry.twitch.channel === channel);
                if (!channelExists) {
                    channelsToLeave.add(channel);
                    hasChanges = true;
                }
            } catch (error) {
                console.error(`Error finding settings for ${channel}:`, error);
            }
        }));

        await Promise.all(Object.keys(settings.savedSettings).map(async (twitchId) => {
            const userSettings = settings.savedSettings[twitchId];
            const twitchChannel = userSettings.twitch.channel;

            try {
                const isStreamerOnlineNow = await botUtils.isStreamOnline(twitchChannel);
                if ((botUtils.isCreatorChannel(twitchChannel) || isStreamerOnlineNow) && !connectedChannels.includes(twitchChannel)) {
                    channelsToJoin.add(twitchChannel);
                    hasChanges = true;
                } else if (!isStreamerOnlineNow && !botUtils.isCreatorChannel(twitchChannel) && connectedChannels.includes(twitchChannel)) {
                    channelsToLeave.add(twitchChannel);
                    hasChanges = true;
                }
            } catch (error) {
                console.error(`Error checking stream status for ${twitchChannel}:`, error);
            }
        }));

        if (hasChanges) {
            for (const channel of channelsToJoin) {
                try {
                    await client.join(channel);
                    //console.log(`[Channels]`, `[UpdateChannels]`, `${channel}`);
                } catch (joinError) {
                    console.error(`Error joining ${channel}:`, joinError);
                }
            }

            for (const channel of channelsToLeave) {
                try {
                    await client.part(channel);
                } catch (leaveError) {
                    console.error(`Error leaving ${channel}:`, leaveError);
                }
            }
            connectedChannels = Array.from(new Set([...connectedChannels, ...Array.from(channelsToJoin)]))
                .filter(channel => !channelsToLeave.has(channel));
            if (channelsToJoin.size > 0) {
                await info(`CHANNELS JOINED`, Array.from(channelsToJoin));
            }

            if (channelsToLeave.size > 0) {
                await info('CHANNELS LEFT', Array.from(channelsToLeave));
            }
        } else {
            await info(`CHANNEL UPDATE`, `${connectedChannels.length} channels connected - ${connectedChannels.join(', ')}`);
        }

    } catch (error) {
        console.error('An error occurred in updateChannels:', error);
    }
}

module.exports = {updateChannels, connectedChannels};
