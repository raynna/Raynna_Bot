const Settings = require("../../settings/Settings");
const { getData, RequestType } = require("../../requests/Request");
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

	class Merchant {
		constructor() {
			this.name = 'Merchant';
			this.triggers = ["merch", "travellingmerchant", "merchantshop"];
			this.settings = new Settings();
			this.game = "RuneScape";
		}

		async execute(tags, channel, argument, client, isBotModerator) {
			try {
				const result = await extractMerchantItems("https://runescape.wiki/w/Travelling_Merchant%27s_Shop");
				return result
					? result
					: "Couldn't extract merchant information.";
			} catch (error) {
				console.log(`An error has occurred while executing command ${this.name}`, error);
				return "An error occurred while fetching Travelling Merchant.";
			}
		}
	}

	async function extractMerchantItems(url) {
		console.log(`[DEBUG] Launching browser...`);
		const browser = await puppeteer.launch({ headless: true });
		const page = await browser.newPage();

		page.on('console', msg => {
			for (let i = 0; i < msg.args().length; ++i)
				msg.args()[i].jsonValue().then(val => console.log(`[PAGE LOG]`, val));
		});

		console.log(`[DEBUG] Navigating to ${url}`);
		await page.goto(url, { waitUntil: 'domcontentloaded' });

		console.log(`[DEBUG] Waiting for .wikitable...`);
		await page.waitForSelector('.wikitable', { timeout: 5000 });

		console.log(`[DEBUG] Evaluating page content...`);
		const items = await page.evaluate(() => {
			const debugLogs = [];
			const tables = document.querySelectorAll('.wikitable');
			debugLogs.push(`Found ${tables.length} .wikitable(s)`);

			// Log all tables and their rows
			tables.forEach((table, tIndex) => {
				debugLogs.push(`\n[TABLE ${tIndex}] -------------------`);
				const rows = table.querySelectorAll('tr');
				debugLogs.push(`Table ${tIndex} has ${rows.length} row(s)`);

				rows.forEach((row, rIndex) => {
					const rowText = row.innerText.trim();
					debugLogs.push(`Row ${rIndex}: ${rowText}`);
				});
			});

			const merchantTable = tables[2];
			const itemsFromTable2 = [];

			if (!merchantTable) {
				debugLogs.push(`ERROR: Table 2 not found.`);
				console.log(debugLogs.join('\n'));
				return [];
			}

			const merchantRows = merchantTable.querySelectorAll('tr');

			for (let i = 1; i < merchantRows.length; i++) {
				const row = merchantRows[i];
				const links = row.querySelectorAll('a');

				debugLogs.push(`Table 2 - Row ${i}: Found ${links.length} <a> tag(s)`);

				let foundItem = null;

				links.forEach((link, lIndex) => {
					const text = link.textContent.trim();
					debugLogs.push(`\tLink ${lIndex + 1}: "${text}"`);
					if (!foundItem && text) {
						foundItem = text; // First valid link only
					}
				});

				if (foundItem) {
					itemsFromTable2.push(foundItem);
				}
			}

			console.log(debugLogs.join('\n'));
			return itemsFromTable2;
		});

		console.log(`[DEBUG] Closing browser...`);
		await browser.close();

		console.log(`[DEBUG] Final extracted items:`, items);
		return items.length > 0
			? `Today's Merchant Shop items: ${items.join(', ')}`
			: "No items found for today.";
	}

module.exports = Merchant;
