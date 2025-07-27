// src/utils/logger.ts
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { NODE_ENV } from '../config/config';

// Type for our custom log levels
type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'debug';

const isDevelopment = NODE_ENV === 'development';

// Define log levels and colors
const levels: Record<LogLevel, number> = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

const colors: Record<LogLevel, string> = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white'
};

winston.addColors(colors);

// Base format for all transports
const baseFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat()
);

// Development format - colorful and human-readable
const devFormat = winston.format.combine(
    baseFormat,
    winston.format.colorize({ all: true }),
    winston.format.printf(
        ({ timestamp, level, message, stack, ...meta }) =>
            `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''} ${stack ? `\n${stack}` : ''
            }`
    )
);

// Production format - structured JSON
const prodFormat = winston.format.combine(
    baseFormat,
    winston.format.json()
);

// Configure transports
const transports: winston.transport[] = [
    // Console transport (always enabled)
    new winston.transports.Console({
        format: isDevelopment ? devFormat : prodFormat,
        level: isDevelopment ? 'debug' : 'info'
    })
];

// File transports (production only)
if (!isDevelopment) {
    transports.push(
        new DailyRotateFile({
            filename: 'logs/application-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d',
            format: prodFormat
        }),
        new DailyRotateFile({
            filename: 'logs/error-%DATE%.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '30d',
            level: 'error',
            format: prodFormat
        })
    );
}

// Create the logger instance
const logger = winston.createLogger({
    level: isDevelopment ? 'debug' : 'info',
    levels,
    transports,
    // Handle exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({
            filename: 'logs/exceptions.log',
            format: prodFormat
        })
    ],
    rejectionHandlers: [
        new winston.transports.File({
            filename: 'logs/rejections.log',
            format: prodFormat
        })
    ],
    exitOnError: false // Don't crash on unhandled exceptions
});

// Stream for morgan HTTP logging
export const httpLogStream = {
    write: (message: string) => {
        logger.http(message.substring(0, message.lastIndexOf('\n')));
    }
};

// Add a method for sanitizing sensitive data in logs
export const sanitizeForLog = (data: any): any => {
    if (typeof data !== 'object' || data === null) return data;

    const sensitiveFields = [
        'password', 'password_hash', 'token',
        'access_token', 'refresh_token', 'authorization'
    ];

    return Object.fromEntries(
        Object.entries(data).map(([key, value]) => [
            key,
            sensitiveFields.includes(key)
                ? '***REDACTED***'
                : typeof value === 'object'
                    ? sanitizeForLog(value)
                    : value
        ])
    );
};

export default logger;