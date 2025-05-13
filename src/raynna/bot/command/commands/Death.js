const Settings = require('../../settings/Settings');

class Death {

    constructor() {
        this.name = 'Death';
		this.game = "General";
        this.triggers = ["dead", "died", "killed", "deaths"];
		this.settings = new Settings();
		this.deathMessages = [
            "Oh no.. {name} has died.",
            "RIP {name} 💀",
            "{name} met an unfortunate end.",
            "Tragic! {name} bit the dust.",
            "{name} is no more. Rest in pixels.",
            "Welp, {name} got rekt again.",
            "Another one bites the dust: {name}.",
            "{name} just rage quit... from life.",
            "Game over for {name}...",
            "Press F to pay respects to {name}.",
			"{name} died trying to pause a live game.",
			"{name} zigged when they should’ve zagged.",
    		"Fatal error: {name} has stopped responding.",
    		"{name} stepped on a LEGO and never recovered.",
    		"Legend says {name} is still falling...",
    		"Cause of death: poor life decisions by {name}.",
    		"{name} just unlocked the 'You Tried' achievement.",
    		"The floor was lava. {name} forgot.",
    		"{name} was too brave... and not very smart.",
    		"{name} got clapped so hard the game apologized.",
    		"Death by potato aim: {name}'s legacy.",
    		"{name} ran out of skill points.",
    		"{name} just speedran the afterlife.",
    		"One moment {name} was alive, the next... patch notes.",
    		"{name} has been yeeted into the void.",
    		"Even the tutorial couldn't save {name}.",
    		"{name} got combo'd into next Tuesday.",
    		"{name} tried to block with their face.",
    		"{name} took an arrow to the everything.",
    		"{name} was defeated by lag — the true final boss.",
    		"{name} failed the vibe check... fatally.",
    		"{name} forgot fall damage was a thing.",
    		"{name} got teabagged into oblivion.",
    		"{name} was out of potions, out of luck.",
			"{name} got critically hit by gravity.",
			"{name} walked straight into a cutscene death.",
			"{name} lost a 1v1 to a tutorial enemy.",
			"{name} tried to parry a nuke.",
			"{name} mistook the boss for a friendly NPC.",
			"{name} tripped over the respawn button.",
			"{name} didn't read the tooltips — now they're one.",
			"{name} used a fork in a toaster. IRL.",
			"{name} tried stealth. Forgot crouch.",
			"{name} missed the quick-time event... permanently.",
			"{name} died because they alt-tabbed mid-fight.",
			"{name} rolled a natural 1. On everything.",
			"{name} got deleted by a skill issue.",
			"{name} trusted the random teammate. Fatal.",
			"{name} stared into the void. It stared back.",
			"{name} thought they were immune to explosions.",
			"{name} walked into a boss room with 1 HP.",
			"{name} pressed Alt+F4... with their soul.",
			"{name} confused a mimic for a chest. Rookie move.",
			"{name} tried to dodge... but rolled into the attack.",
			"{name} thought friendly fire was just a suggestion.",
			"{name} forgot to equip armor. Again.",
			"{name} lagged into the shadow realm.",
			"{name} got disconnected from life.",
			"{name} activated hard mode by existing.",
			"{name} mistook a cliff for a shortcut.",
			"{name} was last seen taunting the boss.",
			"{name} chose violence — and lost.",
			"{name} fought bravely, died stupidly.",
			"{name} thought they were speedrunning. They were.",
			"{name} forgot saving was an option.",
			"{name} entered the wrong dungeon at the wrong time.",
			"{name} looked away for *one* second.",
			"{name} alt-tabbed, alt-lived, alt-died.",
			"{name} got ratio'd by an NPC.",
			"{name} used their last breath to say 'I'm fine.'",
			"{name} underestimated the tutorial boss.",
			"{name} just rage quit the mortal realm.",
			"{name} confused the self-destruct button for sprint.",
			"{name} died as they lived — confused and on fire.",
			"{name} failed the stealth mission loudly.",
			"{name} found out the hard way it's not cosmetic armor.",
			"{name} challenged the final boss... unarmed.",
			"{name} went AFK in a PvP zone. Rookie mistake."

        ];
    }
	
    getRandomMessage(name) {
        const index = Math.floor(Math.random() * this.deathMessages.length);
        return this.deathMessages[index].replace('{name}', name);
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
		const arg = argument ? argument.trim() : '';
		const channelName = channel.startsWith('#') ? channel.slice(1).toLowerCase() : channel;
		const playerIsMod = tags.mod;
		const isStreamer = channel.slice(1).toLowerCase() === tags.username.toLowerCase();
		const isCreator = tags.username.toLowerCase() === process.env.CREATOR_CHANNEL;
		const isAuthorized = playerIsMod || isStreamer || isCreator;
		let deaths = await this.settings.getDeaths(channelName) || 0;
		if (!isAuthorized) {
			if (deaths == 1) {
				return `${channelName} has only died once!`;
			}
			return `${channelName} has died in total of ${deaths} times!`;
		}
		if (arg.toLowerCase() === "reset") {
			await this.settings.resetDeaths(channelName);
			return `Reset all deaths for ${channelName}.`
		}
		await this.settings.saveDeath(channelName);
		deaths = await this.settings.getDeaths(channelName) || 0;
		const message = this.getRandomMessage(channelName);

		if (deaths > 1) {
			return `${message} - Total Deaths: ${deaths}`;
			return;
		}
		return `${message}`;
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
        }
    }
}

module.exports = Death;