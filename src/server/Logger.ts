import winston, { format, transports } from 'winston';

const IS_DEVELOPMENT_MODE = process.env.IS_DEVELOPMENT_MODE;

let logger: winston.Logger | null = null;

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
})

export function initLogging(filename: string) {
  if (!logger) {
    logger = winston.createLogger({
      level: 'info',
      format: format.combine(     
        format.timestamp({
          format: 'DD-MM-YYYY HH:mm:ss'
        }),
        customFormat,
        format.errors({ stack: true }),
        format.splat()
      ),
      transports: [
        new transports.File({ filename, level: 'info' }),
      ]
    });

    if (IS_DEVELOPMENT_MODE) {
      logger.add(new winston.transports.Console({
        format: winston.format.simple()
      }));
    }
  }
}

export { logger };
