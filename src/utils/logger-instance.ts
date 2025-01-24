import { type ConsolaInstance, createConsola } from "consola";
import { colorize } from "consola/utils";
import { getCurrentTimestamp } from "#/utils/timestamp";

type LoggerMethod = (...args: unknown[]) => void;

/**
 * Creates a new logger instance with timestamp functionality added to each log method.
 *
 * @param baseLogger - The base Consola logger instance to extend
 * @returns A new ConsolaInstance with timestamp-enhanced logging methods
 *
 * The returned logger instance wraps each logging method to prepend a timestamp
 * while preserving the original logger's functionality. Methods like `silent` and `box`
 * are bound to the original logger instance.
 *
 * @example
 * ```ts
 * const baseLogger = createConsola();
 * const logger = createLoggerInstance(baseLogger);
 * logger.info('Hello, World!'); // Will output with timestamp: [2023-01-01 12:00:00] Hello, World!
 * ```
 */
export function createLoggerInstance(baseLogger: ConsolaInstance): ConsolaInstance {
    const withTimestamp = (fn: LoggerMethod): LoggerMethod => {
        return (...args: unknown[]) => {
            fn(colorize("gray", `[${getCurrentTimestamp()}]`), ...args);
        };
    };

    return {
        log: withTimestamp(baseLogger.log),
        info: withTimestamp(baseLogger.info),
        warn: withTimestamp(baseLogger.warn),
        error: withTimestamp(baseLogger.error),
        success: withTimestamp(baseLogger.success),
        debug: withTimestamp(baseLogger.debug),
        trace: withTimestamp(baseLogger.trace),
        fatal: withTimestamp(baseLogger.fatal),
        ready: withTimestamp(baseLogger.ready),
        start: withTimestamp(baseLogger.start),
        silent: baseLogger.silent.bind(baseLogger),
        box: baseLogger.box.bind(baseLogger),
        level: baseLogger.level,
        create: baseLogger.create,
    } as ConsolaInstance;
}

export const loggerInstance: ConsolaInstance = createLoggerInstance(
    createConsola({
        formatOptions: {
            compact: true,
            date: false,
        },
    })
);
