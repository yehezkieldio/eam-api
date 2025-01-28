import { afterEach, beforeEach, describe, expect, it, spyOn } from "bun:test";
import { type Consola, LogLevels } from "consola";
import { formatTimestamp, log } from "#/libs/logger";

describe("logger", () => {
    let originalLogLevel: number;
    let originalStderr: typeof process.stderr.write;
    let originalStdout: typeof process.stdout.write;

    beforeEach(() => {
        log.wrapAll();
        originalLogLevel = log.level;

        // Mock both stderr and stdout
        originalStderr = process.stderr.write;
        originalStdout = process.stdout.write;
        process.stderr.write = () => true;
        process.stdout.write = () => true;
    });

    afterEach(() => {
        log.level = originalLogLevel;

        // Restore both stderr and stdout
        process.stderr.write = originalStderr;
        process.stdout.write = originalStdout;
    });

    it("should log an info message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "info");
        log.info("This is an info message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("info");
    });

    it("should log a success message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "success");
        log.success("This is a success message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("success");
    });

    it("should log a warning message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "warn");
        log.warn("This is a warning message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("warn");
    });

    it("should log an error message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "error");
        log.error("This is an error message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("error");
    });

    it("should log a debug message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "debug");
        log.debug("This is a debug message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("debug");
    });

    it("should log a trace message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "trace");
        log.trace("This is a trace message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("trace");
    });

    it("should log a start message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "start");
        log.start("This is a start message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("start");
    });

    it("should log a log message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "log");
        log.log("This is a log message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("log");
    });

    it("should log a silent message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "silent");
        log.silent("This is a silent message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("silent");
    });

    it("should log a ready message correctly", (): void => {
        log.level = LogLevels.verbose;
        const consoleSpy = spyOn(log, "ready");
        log.ready("This is a ready message");

        const lastLog = (consoleSpy.mock.contexts[0] as Consola)._lastLog;
        expect(lastLog.serialized).toContain("ready");
    });

    it("should set the log level correctly", (): void => {
        log.level = LogLevels.verbose;
        expect(log.level).toBe(LogLevels.verbose);
    });

    it("should format the timestamp correctly", (): void => {
        const date = new Date("2024-10-01T12:34:56Z");
        const formattedTimestamp = formatTimestamp(date); // [10/01/2024 12:34:56]
        expect(formattedTimestamp).toMatch(/\[\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\]/);
    });
});
