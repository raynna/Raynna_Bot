const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");


const shortcuts = [
    {name: 'abyssal whip', triggers: ['whip']},
    {name: 'fractured staff of armadyl', triggers: ['fsoa', 'armadyl staff', 'arma staff']},
    {name: 'blue partyhat', triggers: ['blue phat', 'blue party hat']},
    {name: 'yellow partyhat', triggers: ['yellow phat', 'yellow party hat']},
    {name: 'white partyhat', triggers: ['white phat', 'white party hat']},
    {name: 'purple partyhat', triggers: ['purple phat', 'purple party hat']},
    {name: 'red partyhat', triggers: ['red phat', 'red party hat']},
    {name: 'green partyhat', triggers: ['green phat', 'green party hat']},
    {name: "Red hallowe'en mask", triggers: ['red wheen', "red h'ween", 'red hween mask']},
    {name: "Blue hallowe'en mask", triggers: ['blue wheen', "blue h'ween", 'blue hween mask']},
    {name: "Green hallowe'en mask", triggers: ['green wheen', "green h'ween", 'green hween mask']},
    {name: "Purple hallowe'en mask", triggers: ['purple wheen', "purple h'ween", 'purple hween mask']},
    {name: "Orange hallowe'en mask", triggers: ['orange wheen', "orange h'ween", 'orange hween mask']},
    {name: 'golden partyhat', triggers: ['golden phat']},
    {name: 'christmas cracker', triggers: ['cracker']},
    {name: 'bandos chestplate', triggers: ['bcp']},
    {name: 'bandos tassets', triggers: ['tassets','tassys']},
    {name: "Erethdor's grimoire", triggers: ['grim','grimoire', 'grim book', 'Erethdors grimoire']},
    {name: "Scripture of Ful", triggers: ['ful book','ful', 'fulbook', 'ful scripture']},
    {name: "Scripture of Wen", triggers: ['wen book','wen', 'wenbook', 'wen scripture']},
    {name: "Scripture of Bik", triggers: ['bik book','bik', 'bikbook', 'bik scripture']},
    {name: "Scripture of Jas", triggers: ['jas book','Jas', 'jasbook', 'jas scripture']},
    {name: "Bow of the Last Guardian", triggers: ['botlg', 'guardian bow', 'zammy bow', 'bolg']},
    {name: "Essence of Finality amulet", triggers: ['eof']},
    {name: "Armadyl godsword", triggers: ['ags']},
    {name: "Bandos godsword", triggers: ['bgs']},
    {name: "Zaros godsword", triggers: ['zgs']},
    {name: "Saradomin godsword", triggers: ['sgs']},
    {name: "Zamorak godsword", triggers: ['zammy gs','zammygs','zamorak gs']},
    {name: "Seren godbow", triggers: ['sgb', 'seren bow', 'seren gbow']},
    {name: "Brooch of the Gods", triggers: ['botg', 'bog']},
    {name: "Hazelmere's signet ring", triggers: ['hsr', 'signet', 'signet ring']},
    {name: "Masterwork Spear of Annihilation", triggers: ['msoa', 'masterwork spear']},
    {name: "Noxious longbow", triggers: ['noxbow', 'nox bow']},
    {name: "Noxious scythe", triggers: ['nox scythe', 'scythe']},
    {name: "Noxious staff", triggers: ['nox staff', 'noxstaff']},
    {name: "Tavia's fishing rod", triggers: ['rod', 'tavias', 'tavias fishing rod']},
    {name: "Greater Ricochet ability codex", triggers: ['grico', 'greater rico', 'richochet', 'greater ricochet codex']},
    {name: "Greater Chain ability codex", triggers: ['gchain', 'greater chain', 'chain', 'greater chain codex']},
    {name: "Greater Death's Swiftness ability codex", triggers: ['swiftness', 'gswift', 'greater swiftness']},
    {name: "Greater Sunshine ability codex", triggers: ['sunshine', 'gsunshine', 'greater sunshine']},
    {name: "Mazcab ability codex", triggers: ['mazcab', 'corruption shot', 'corruption blast', 'onslaught', 'shatter']},
    {name: "Greater Concentrated blast ability codex", triggers: ['gconc', 'concentrated', 'greater concentrated']},
    {name: "Praesul codex", triggers: ['t99 pray', 'malevolence', 'desolation', 'affliction', 'ruination', 'pray codex']},
    {name: "Dark onyx core", triggers: ['core', 'dark core', 'onyx core']},
    {name: "Saradomin brew (4)", triggers: ['brews', 'sara brews', 'sarabrew', 'saradomin brew']},
    {name: "Saradomin brew flask (6)", triggers: ['saraflask', 'sara flask', 'saradomin flask', 'brew flask']},
    {name: "Super Saradomin brew flask (6)", triggers: ['super sara flask', 'super saraflask', 'super saradomin', 'super flask']},
    {name: "Dragon Rider lance", triggers: ['lance', 'dragonrider lance', 'dragonrider']},
];


class PriceCheck {

    constructor() {
        this.name = 'PriceCheck';
        this.triggers = ['pc', 'price'];
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
    try {
        let itemName = argument ? argument.trim() : "";
        if (!itemName) {
            return `You didn't enter a valid RuneScape Item`;
        }

        // First, attempt to fetch the exact item name from the DB
        let itemFound = false;
        let shortcutItemName = itemName;
        
        const { data: db, errorMessage: message } = await getData(RequestType.ItemDB, itemName.split(" ").join("%20"));
        
        // If no exact match is found, check against the triggers
        if (!db[0] || !db) {
            for (const shortcut of shortcuts) {
                for (const trigger of shortcut.triggers) {
                    if (itemName.toLowerCase() === trigger) {
                        itemFound = true;
                        shortcutItemName = shortcut.name.split(" ").join("%20");
                        break;
                    }
                }
                if (itemFound) break; // Exit loop once a match is found
            }
        } else {
            itemFound = true; // Exact item found in DB
        }

        if (!itemFound) {
            return `Couldn't find any valid RuneScape item name: ${itemName.replace("%20", " ")}`;
        }

        // Now fetch data based on the resolved itemName (either exact or trigger-based)
        const { data: finalDb, errorMessage: finalMessage } = await getData(RequestType.ItemDB, shortcutItemName);
        if (finalMessage) {
            return finalMessage;
        }
        if (!finalDb[0] || !finalDb) {
            return `Couldn't find any valid RuneScape item name: ${shortcutItemName.replace("%20", " ")}`;
        }

        const { id, value, tradeable } = finalDb[0];
        let alchValue = Math.floor(value * 0.60);
        if (alchValue < 1) {
            alchValue = 1;
        }

        if (!tradeable) {
            return `Item ${finalDb[0].name} is an untradeable item, Alchemy value: ${alchValue} gp.`;
        }

        const { data: item, errorMessage: itemMessage } = await getData(RequestType.ItemLookup, id);
        if (itemMessage) {
            return itemMessage;
        }

        const { name, current, day30, day90, day180 } = item.item;
        if (!current) {
            return `Couldn't find current data for ${name}`;
        }

        const { price } = current;
        return `${name}, Price: ${price} gp, Changes in days: 30 (${day30.change}), 90 (${day90.change}), 180 (${day180.change}), Alchemy value: ${alchValue} gp`;
        
    } catch (error) {
        console.log(`An error has occurred while executing command ${this.name}`, error);
    }
}

}

module.exports = PriceCheck;