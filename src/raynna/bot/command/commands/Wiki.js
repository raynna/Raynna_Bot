const Settings = require("../../settings/Settings");


class Wiki {

    constructor() {
        this.name = 'Wiki';
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let wikiSearch = argument ? argument.trim().split(" ").join("_") : "";
            if (!wikiSearch) {
                return `You didn't enter anything to search for.`;
            }
            return `Wiki search for: ${wikiSearch.split("_").join(" ")}, https://runescape.wiki/w/${wikiSearch}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Wiki;