const Settings = require("../../settings/Settings");
const { getData, RequestType } = require("../../requests/Request");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class WildernessEvent {
    constructor() {
        this.name = 'WildernessEvent';
        this.triggers = ["wildyevent", "wildy", "event"];
        this.settings = new Settings();
        this.game = "RuneScape";
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const result = await extractEvent("https://runescape.wiki/w/Wilderness_Flash_Events");
            return result
                ? result
                : "Couldn't extract event information.";
        } catch (error) {
            console.log(`An error has occurred while executing command ${this.name}`, error);
            return "An error occurred while fetching Wilderness event.";
        }
    }
}

async function extractEvent(url) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.waitForFunction(() => {
        const eventElement = document.querySelector('.table-bg-yellow, .table-bg-green');
        return eventElement && eventElement.innerText !== ''; // Check if the event text is populated
    }, { timeout: 10000 }); // Wait up to 10 seconds

    const eventData = await page.evaluate(() => {
        function timeToMinutes(time) {
            const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
            return hours * 60 + minutes;
        }

        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();
        const activeEventElement = document.querySelector('.table-bg-green a.mw-selflink-fragment');
        const activeEvent = activeEventElement ? activeEventElement.innerText : '';
        const activeTimeElement = document.querySelector('.table-bg-green small');
        const activeTime = activeTimeElement ? activeTimeElement.innerText : '';

        let event = activeEvent;
        let time = activeTime;

        if (!activeEvent) {
            const nextEventElement = document.querySelector('.table-bg-yellow a.mw-selflink-fragment');
            event = nextEventElement ? nextEventElement.innerText : '';
            const timeElements = document.querySelectorAll('.table-bg-yellow small');
            if (timeElements.length > 1) {
                time = timeElements[1]?.innerText || '';
            } else if (timeElements.length > 0) {
                time = timeElements[0]?.innerText || '';
            }
        }

        const specialEvents = Array.from(document.querySelectorAll('.table-bg-grey'))
            .filter(el => el.querySelector('i') && el.querySelector('small'))
            .map(el => {
                const specialEventName = el.querySelector('a.mw-selflink-fragment')?.innerText;
                const specialEventTime = el.querySelectorAll('small')[1]?.innerText || el.querySelector('small')?.innerText;
                return { specialEventName, specialEventTime, minutes: timeToMinutes(specialEventTime) };
            });

        const sortedSpecialEvents = specialEvents
            .map(event => ({
                ...event,
                delta: (event.minutes - currentTimeInMinutes + 1440) % 1440,
            }))
            .sort((a, b) => a.delta - b.delta);

        const nextSpecialEvent = sortedSpecialEvents[0];

        return { event, time, specialEvent: nextSpecialEvent?.specialEventName || '', specialTime: nextSpecialEvent?.specialEventTime || '' };
    });

    await browser.close();
    const now =  new Date();
    const ingameHours = now.getUTCHours(); // RuneScape time is UTC
    const ingameMinutes = now.getUTCMinutes(); // Get minutes as well

    const ingameTime = `${ingameHours.toString().padStart(2, '0')}:${ingameMinutes.toString().padStart(2, '0')}`;
    return `Ingame Time: ${ingameTime}, Next event: ${eventData.event} (${eventData.time}), ${
        eventData.specialEvent && eventData.specialTime ? `Next special: ${eventData.specialEvent} (${eventData.specialTime})` : 'No special event.'}`;
}






module.exports = WildernessEvent;
