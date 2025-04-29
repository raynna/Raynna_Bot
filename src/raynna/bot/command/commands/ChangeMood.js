const Settings = require('../../settings/Settings');
const { getData, RequestType } = require('../../requests/Request');

class ChangeMood {
    constructor() {
        this.moderator = true;
		this.triggers = ["humör", "mood", "moods"];
        this.name = 'ChangeMood';
        this.settings = new Settings();
        this.game = "General";
        this.validMoods = [
		'angry', 'negative', 'positive', 'upset', 'sad', 'happy', 'neutral', 'rude',
		'sassy',         // Snarky and playful
		'giga-chad',     // Overconfident and exaggerated bravado
		'boomer',        // Talks like an old-school internet user or out-of-touch parent
		'edgy',          // Sarcastic and tries to be provocative
		'goblin',        // Mischievous and chaotic
		'robotic',       // Cold and emotionless
		'drunk',         // Sloppy and overly friendly or dramatic
		'cowboy',        // Western-style drawl and metaphors
		'rapper',        // Rapper style
		'shakespearean', // Speaks like it's 1600s England
		'emo',           // Overdramatic and brooding
		'tsundere',      // Pretends not to care but clearly does
		'valley-girl',   // Super chatty and superficial
		'pirate',        // "Yarr!" and seafaring speech
		'toddler',       // Simple words, lots of excitement or confusion
		'gremlin',         // Unhinged chaos goblin energy, always scheming or laughing weirdly
		'dark-lord',       // Evil mastermind voice, full of grandeur and doom
		'conspiracy',      // Speaks in wild, tinfoil-hat theories and paranoia
		'cat',             // Responds like a self-centered, aloof housecat
		'dog',             // Super loyal, overly enthusiastic and excited
		'grandma',         // Old-school, loving but blunt, offers cookies and judgment
		'fortune-teller',  // Speaks in riddles and predictions with mystical flair
		'zombie',          // Slow, hungry, and brain-obsessed — but funny
		'bard',            // Responds in rhymes or song like a D&D bard
		'meme-lord',       // Filled with internet slang, memes, and Gen Z references
		'tech-bro',        // Startup hustle talk, always pitching ideas or saying "let's circle back"
		'canadian',        // Overly polite, friendly, and says "sorry" a lot
		'yandere',         // Creepy but affectionate, like "If I can’t have you, no one can."
		'villain-monologue', // Dramatic evil speeches about taking over the world
		'stoner',          // Chill, spaced out, and full of weird wisdom
		'minion',          // Nonsensical gibberish and banana references
		'chaotic-neutral', // Pure randomness, unpredictable but not evil
		'karen',           // Always wants to speak to the manager
		'gen-z',           // Vibes, slang, and emotional damage
		'retro-gamer',     // Talks in 80s/90s arcade slang or old-school gaming lingo
		'cyberpunk', ];
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let mood = argument ? argument.trim().toLowerCase() : "";

            if (!mood) {
                return `Please provide a mood (e.g., !mood happy). Valid moods: ${this.validMoods.join(', ')}`;
            }

            if (mood === "random") {
				mood = this.validMoods[Math.floor(Math.random() * this.validMoods.length)];
			} else if (mood === "reset") {
				mood = 'neutral';
			} else if (!this.validMoods.includes(mood)) {
				return `Invalid mood "${mood}". Valid moods are: ${this.validMoods.join(', ')}`;
			}

            const channelWithoutHash = channel.startsWith('#') ? channel.slice(1).toLowerCase() : channel.toLowerCase();
            const { data: twitch, errorMessage: twitchError } = await getData(RequestType.TwitchUser, channelWithoutHash);
            if (twitchError) {
                return twitchError;
            }

            const { id: twitchId } = twitch.data[0];
            await this.settings.check(twitchId);

            await this.settings.saveMood(twitchId, mood);

            return `My Mood for channel ${channel} has been changed to "${mood}".`;

        } catch (error) {
            console.error(`An error occurred while executing command ${this.name}:`, error);
            return `Something went wrong while setting the mood.`;
        }
    }
}

module.exports = ChangeMood;
