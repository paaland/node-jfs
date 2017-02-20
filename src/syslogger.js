var syslog = require('syslog-client');
var dateformat = require('dateformat');

var logger = {};
var logLevel = {};

module.exports = {
    setConfig: setConfig,
    logDebug: logDebug,
    logInfo: logInfo,
    logError: logError,
    logCrit: logCrit
};

function setConfig(syslogServer, level) {
    console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Using syslog server ' + syslogServer + ' with log level ' + level);
    logger = syslog.createClient(syslogServer);
    logLevel = level;
}

function logDebug(message) {
    if (logger && logLevel >= 7) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Debug 
        });
    }
}

function logInfo(message) {
    if (logger && logLevel >= 6) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Informational 
        });
    }
}

function logError(message) {
    if (logger && logLevel >= 3) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Error
        });
    }
}

function logCrit(message) {
    if (logger && logLevel >= 2) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Critical
        });
    }
}

