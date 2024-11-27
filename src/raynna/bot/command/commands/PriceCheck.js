const {getData, RequestType} = require("../../requests/Request");
const Settings = require("../../settings/Settings");
const {minigameIndex} = require("../../utils/MinigamesUtils");


const shortcuts = [
    {name: 'abyssal whip', triggers: ['whip']},
    {name: 'fractured staff of armadyl', triggers: ['fsoa', 'armadyl staff', 'arma staff']},
    {name: 'blue partyhat', triggers: ['blue phat']},
    {name: 'yellow partyhat', triggers: ['yellow phat']},
    {name: 'white partyhat', triggers: ['white phat']},
    {name: 'purple partyhat', triggers: ['purple phat']},
    {name: 'red partyhat', triggers: ['red phat']},
    {name: 'green partyhat', triggers: ['green phat']},
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
];


class PriceCheck {

    constructor() {
        this.name = 'PriceCheck';
        this.triggers = ['pc', 'price'];
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            let itemName = argument ? argument.trim() : "";
            if (!itemName) {
                return `You didn't enter a valid RuneScape Item`;
            }
            for (const shortcut of shortcuts) {
                for (const trigger of shortcut.triggers) {
                    if (itemName.toLowerCase().includes(trigger)) {
                        itemName = shortcut.name.split(" ").join("%20");
                        break;
                    }
                }
            }
            const { data: db, errorMessage: message } = await getData(RequestType.ItemDB, itemName.split(" ").join("%20"));
            if (message) {
                return message;
            }
            if (!db[0] || !db) {
                return `Couldn't find any valid RuneScape item name: ${itemName.replace("%20", " ")}`;
            }
            console.log(JSON.stringify(db));
            const { id, value, tradeable } = db[0];
            let alchValue = Math.floor(value * 0.60);
            if (alchValue < 1) {
                alchValue = 1;
            }
            if (!tradeable) {
                return `Item ${db[0].name} is an untradeable item, Alchemy value: ${alchValue} gp.`;
            }
            const { data: item, errorMessage: itemMessage } = await getData(RequestType.ItemLookup, id);
            if (itemMessage) {
                return itemMessage;
            }
            console.log(JSON.stringify(item));
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