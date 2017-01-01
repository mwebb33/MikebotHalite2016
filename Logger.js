
var Logger = require('winston');

Logger.remove(Logger.transports.Console);

Logger.add(
  Logger.transports.File,
  {
    filename: 'match.log',
    json: false,
  }
);

// cause the process to wait giving time for the logs to get flushed to the file
process.on('exit', () => {
  setTimeout(() => {}, 5000);
});

process.on('uncaughtException', (err) => {
  // remove and readd the file transport to deal with a bug with adding formatters that won't log errors
  Logger.remove(Logger.transports.File);
  Logger.add(Logger.transports.File, { filename: 'match.log' });
  Logger.log('error', 'Fatal uncaught exception', err);
});

module.exports = Logger; 