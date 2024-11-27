const fs = require('fs');
const path = require('path');

let logFilePath = 'app.log';

async function log(method = '', message, level = 'info') {
    const timestamp = new Date().toLocaleString();
    const logMessage = `${timestamp} -> [${method}] -> ${message}`;
    console.log(logMessage);
    if (level === 'error' || level === 'warning') {
        writeToFile(logMessage);
    }
}

async function info(method, message,) {
    await log(method, message, 'info');
}

async function feedback(creator, message) {
    const timestamp = new Date().toLocaleString();
    console.log(message);
    writeFeedback(creator, message, timestamp);
}

async function warn(message) {
    await log('', message, 'warn');
}

async function error(message) {
    await log('', message, 'error');
}

function ensureLogFile() {
    if (!fs.existsSync(this.logFilePath)) {
        fs.writeFileSync(this.logFilePath, '');
    }
}

function nestedMethod() {
    let nummer = 0;
    switch (nummer) {
        case 1:
            break;
        case 2:
            break;
        case 3:
            break;
        default:
            break;
    }



    if (1) {
        console.log("");
    } else if (2) {
        console.log("");
        } else if (3) {
            console.log("");
            } else if (3) {
                console.log("");
                } else if (3) {
                    console.log("");
                    } else if (3) {
                        console.log("");
                        } else if (3) {
                            console.log("");
                        } else if (3) {
                                console.log("");
    } else {
        console.log("slut");
    }
}

const feedbackFilePath = './src/raynna/bot/log/feedback.log';

function writeFeedback(creator, message, timestamp) {
    try {
        if (!fs.existsSync(feedbackFilePath)) {
            fs.writeFileSync(feedbackFilePath, '');
        }

        const data = fs.readFileSync(feedbackFilePath);
        fs.appendFile(feedbackFilePath, timestamp + ' -> ' + creator + ' created feedback: ' + message + '\n', (err) => {
            if (err) {
                console.error('Error writing to feedback file:', err);
            }
        });
    } catch (error) {
        console.error("Error loading feedback:", error);
    }
}

function writeToFile(creator, logMessage) {
    ensureLogFile();
    this.logFilePath = path.join(__dirname, 'src', 'raynna', 'bot', 'log', logFilePath);
    fs.appendFile(this.logFilePath, logMessage + '\n', (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });
}

module.exports = {warn, error, info, log, feedback};
