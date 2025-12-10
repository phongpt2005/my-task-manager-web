const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, '../../server.log');

const log = (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync(logFile, logMessage);
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
};

module.exports = { log };
