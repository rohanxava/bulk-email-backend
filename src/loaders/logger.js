require("express-async-errors");
const winston = require('winston')
var expressWinston = require('express-winston');

module.exports = function (app) {
    winston.exceptions.handle(
        new winston.transports.File({
            filename: "./logs/uncaughtExceptions.log", format: winston.format.combine(
                winston.format.timestamp({
                    format: 'YYYY-MM-DD hh:mm:ss A ZZ'
                }),
                winston.format.json()
            )
        },
            new winston.transports.Console({ colorize: true, prettyPrint: true })
        ));

    process.on("unhandledRejection", ex => {
        throw ex;
    });

    winston.add(new winston.transports.File({
        filename: "./logs/logfile.log", format: winston.format.combine(
            winston.format.timestamp({
                format: 'YYYY-MM-DD hh:mm:ss A ZZ'
            }),
            winston.format.json()
        ), handleExceptions: true
    }));

    // Set up logging middleware
    if (Boolean(process.env.EnableLog) == true) {
        require('winston-daily-rotate-file');

        var transport = new (winston.transports.DailyRotateFile)({
          filename: './logs/reqres-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '2000m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp({
              format: 'YYYY-MM-DD hh:mm:ss A ZZ'
            }),
            winston.format.json()),
        });
    
    
        app.use(expressWinston.logger({
          transports: [
            transport
          ],
          requestWhitelist: ['headers', 'query', 'body'],
          responseWhitelist: ['body'],
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.json()
          )
        }));
    
      }
};