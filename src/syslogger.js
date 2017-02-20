var syslog = require('syslog-client');
var dateformat = require('dateformat');

var logger = {};

module.exports = {
    setConfig: setConfig,
    logDebug: logDebug,
    logInfo: logInfo,
    logError: logError,
    logCrit: logCrit
};

function setConfig(syslogServer) {
    console.log(dateformat(new Date(), 'dd.mm.yyyy HH:MM:ss') +': Using syslog server ' + syslogServer);
    logger = syslog.createClient(syslogServer);
}

function logDebug(message) {
    if (logger) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Debug 
        });
    }
}

function logInfo(message) {
    if (logger) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Informational 
        });
    }
}

function logError(message) {
    if (logger) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Error
        });
    }
}

function logCrit(message) {
    if (logger) {
        logger.log('node-jfs: ' + message, {
            facility: syslog.Facility.User,
            severity: syslog.Severity.Critical
        });
    }
}

