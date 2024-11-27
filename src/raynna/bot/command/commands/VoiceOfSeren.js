const Settings = require("../../settings/Settings");
const { getData, RequestType } = require("../../requests/Request");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class VoiceOfSeren {
    constructor() {
        this.name = 'Voiceofseren';
        this.triggers = ["vos", "seren", "priffdinas", "priff", "voice"];
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const result = await extractVoSDistricts("https://runescape.wiki/w/Voice_of_Seren"); // Extract the desired content
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

    // Navigate to the provided URL
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Get the full HTML of the page to check for the structure
    const htmlContent = await page.content();

    // Wait for the VoS-district elements to load
    await page.waitForSelector('.VoS-district', { timeout: 3000 });

    // Log all divs on the page to check for the structure of the district divs
    const divs = await page.$$eval('div', divs => divs.map(div => div.outerHTML));

    // Extract the district names from the VoS-district divs
    const districtNames = await page.evaluate(() => {
        const districts = document.querySelectorAll('.VoS-district');

        // Debug: log the district divs found
        console.log("Found district divs:", districts.length);

        return Array.from(districts).map(district => {
            const classList = district.classList;
            const districtName = classList[1].replace('VoS-', '');
            console.log(`District found: ${districtName}`); // Debug: print each district found
            return districtName;
        });
    });

    // If no districts are found, log a message
    if (districtNames.length === 0) {
        console.log("No districts found.");
    }

    // Print the current active districts
    console.log('Current active districts:', districtNames);

    await browser.close();
    return districtNames.length > 0 ? `Current active districts: ${districtNames.join(', ')}` : "No districts found.";
}

module.exports = VoiceOfSeren;
