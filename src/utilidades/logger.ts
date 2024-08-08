import winston from 'winston';
import 'winston-daily-rotate-file';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
);
const transports = [
  new winston.transports.Console(),
  new winston.transports.DailyRotateFile({
    filename: './logs/log-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: process.env.LOGGING_FILE_LEVEL || 'info',
    maxFiles: process.env.LOGGING_RETENTION || '30d',
  }),
];
const logger = winston.createLogger({
  level: process.env.LOGGING_LEVEL || 'info',
  levels,
  format,
  transports,
});

export default logger;