const Settings = require("../../settings/Settings");
const { getData, RequestType } = require("../../requests/Request");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class VoiceOfSeren {
    constructor() {
        this.name = 'Voiceofseren';
        this.triggers = ["vos", "seren", "priffdinas", "priff", "voice"];
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const result = await extractVoSDistricts("https://runescape.wiki/w/Voice_of_Seren");
            return result
                ? result
                : "Couldn't extract district information.";
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
            return "An error occurred while fetching Voice of Seren.";
        }
    }
}

async function extractVoSDistricts(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    const htmlContent = await page.content();

    await page.waitForSelector('.VoS-district', { timeout: 3000 });

    const divs = await page.$$eval('div', divs => divs.map(div => div.outerHTML));

    const districtNames = await page.evaluate(() => {
        const districts = document.querySelectorAll('.VoS-district');

        console.log("Found district divs:", districts.length);

        return Array.from(districts).map(district => {
            const classList = district.classList;
            const districtName = classList[1].replace('VoS-', '');
            console.log(`District found: ${districtName}`); // Debug: print each district found
            return districtName;
        });
    });

    if (districtNames.length === 0) {
        console.log("No districts found.");
    }

    console.log('Current active districts:', districtNames);

    await browser.close();
    return districtNames.length > 0 ? `Current active districts: ${districtNames.join(', ')}` : "No districts found.";
}

module.exports = VoiceOfSeren;
