const Settings = require("../../settings/Settings");
const { getData, RequestType } = require("../../requests/Request");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class WildernessEvent {
    constructor() {
        this.name = 'WildernessEvent';
        this.triggers = ["wildyevent", "wildy", "event"];
        this.settings = new Settings();
    }

    async execute(tags, channel, argument, client, isBotModerator) {
        try {
            const result = await extractEvent("https://runescape.wiki/w/Wilderness_Flash_Events"); // Extract the desired content
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

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });

    // Wait using setTimeout (for older versions of Puppeteer)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds

    // Wait for the event content to update
    await page.waitForFunction(() => {
        const eventElement = document.querySelector('.table-bg-yellow, .table-bg-green');
        return eventElement && eventElement.innerText !== ''; // Check if the event text is populated
    }, { timeout: 10000 }); // Wait up to 10 seconds

    // Extract event data
    const eventData = await page.evaluate(() => {
        // Helper function to parse time strings (e.g., "14:00") into minutes since midnight
        function timeToMinutes(time) {
            const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
            return hours * 60 + minutes;
        }

        // Current time in minutes since midnight
        const now = new Date();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        // Check for active event first
        const activeEventElement = document.querySelector('.table-bg-green a.mw-selflink-fragment');
        const activeEvent = activeEventElement ? activeEventElement.innerText : '';
        const activeTimeElement = document.querySelector('.table-bg-green small');
        const activeTime = activeTimeElement ? activeTimeElement.innerText : '';

        // If no active event, fallback to the next event
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

        // Find the next special event
        const specialEvents = Array.from(document.querySelectorAll('.table-bg-grey'))
            .filter(el => el.querySelector('i') && el.querySelector('small')) // Filter for special events
            .map(el => {
                const specialEventName = el.querySelector('a.mw-selflink-fragment')?.innerText;
                const specialEventTime = el.querySelectorAll('small')[1]?.innerText || el.querySelector('small')?.innerText;
                return { specialEventName, specialEventTime, minutes: timeToMinutes(specialEventTime) };
            });

        // Sort special events by their distance from the current time
        const sortedSpecialEvents = specialEvents
            .map(event => ({
                ...event,
                delta: (event.minutes - currentTimeInMinutes + 1440) % 1440, // Handle wraparound at midnight
            }))
            .sort((a, b) => a.delta - b.delta);

        // Get the next special event
        const nextSpecialEvent = sortedSpecialEvents[0];

        return { event, time, specialEvent: nextSpecialEvent?.specialEventName || '', specialTime: nextSpecialEvent?.specialEventTime || '' };
    });

    await browser.close();

    return `Next event: ${eventData.event} (${eventData.time}). ${
        eventData.specialEvent && eventData.specialTime ? `Next special: ${eventData.specialEvent} (${eventData.specialTime})` : 'No special event.'}`;
}






module.exports = WildernessEvent;
