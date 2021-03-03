var appRoot = require('app-root-path');
var winston = require('winston');

var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 2,
        colorize: false,
    }
};

const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(
        info => `TIMESTAMP: ${info.timestamp}, LEVEL: ${info.level}, MESSAGE: ${info.message}`
    ),
);

var logger = new winston.createLogger({
    format : logFormat,
    transports: [
        new winston.transports.File(options.file)
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding) {
        logger.info(message);
    },
};

//logger.info("Log level selected :: " + logLevel);

module.exports = logger;