class Botinfo {

    constructor() {
        this.name = 'Botinfo';
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let message = `is created by `;
            message += `${process.env.CREATOR_REAL_NAME}`;
            message += `, Twitch: ${process.env.CREATOR_CHANNEL}`;
            message += `, Runescape: ${process.env.CREATOR_RUNESCAPE_NAME}`;
            const isModerator = client.isMod(channel, process.env.TWITCH_BOT_USERNAME);
            if (isModerator) {
                //message += `, Bot Discord: ${process.env.DISCORD_INVITE_LINK}`;
            }
            return message;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Botinfo;