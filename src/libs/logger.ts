import { sep } from "node:path";
import { formatWithOptions } from "node:util";
import { type ConsolaInstance, type FormatOptions, LogLevels, type LogObject, type LogType } from "consola";
import { type ConsolaOptions, createConsola } from "consola/core";
import { type ColorFunction, type ColorName, colors, stripAnsi } from "consola/utils";
import { env } from "#/env";

type FormatStyleFn = () => string;

// Production environment should have log level set to info, and development should have it set to debug.
// With optional TRACE_LOG environment variable to log extremely detailed information on the execution of the application.
let logLevel: number =
    env.NODE_ENV === "test" ? LogLevels.silent : env.NODE_ENV === "production" ? LogLevels.info : LogLevels.debug;

if (env.TRACE_LOG) {
    logLevel = LogLevels.trace;
}

const AT_TRACE_PATTERN = /^at +/;
const PARENTHESES_CONTENT_PATTERN = /\((.+)\)/;

function writeStream(data: string, stream: NodeJS.WriteStream): boolean {
    const write = stream.write;
    return write.call(stream, data);
}

/* -------------------------------------------------------------------------- */

const TYPE_COLOR_MAP: { [k in LogType]?: ColorName } = {
    error: "red",
    fatal: "bgRed",
    ready: "green",
    warn: "yellow",
    info: "blue",
    success: "magenta",
    debug: "cyan",
    trace: "gray",
    fail: "red",
    start: "blue",
    log: "white",
};

const TYPE_PREFIX: { [k in LogType]?: string } = {
    error: "ERROR",
    fatal: "FATAL",
    ready: "READY",
    warn: "WARN",
    info: "INFO",
    success: "INIT",
    debug: "DEBUG",
    trace: "TRACE",
    fail: "FAIL",
    start: "START",
    log: "",
};

export function getColorFn(color: ColorName = "white"): ColorFunction {
    return colors[color] || colors.white;
}

function getBgColor(color = "white"): ColorFunction {
    const firstLetter = color[0].toUpperCase();
    const rest = color.slice(1);
    const colorName: ColorName = `bg${firstLetter}${rest}` as ColorName;

    return colors[colorName] || colors.bgWhite;
}

function characterFormat(str: string) {
    return str
        .replace(/`([^`]+)`/gm, (_, m) => getColorFn("cyan")(m))
        .replace(/\s+_([^_]+)_\s+/gm, (_, m) => ` ${getColorFn("underline")(m)} `);
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
});

/* -------------------------------------------------------------------------- */

function parseStack(stack: string): string[] {
    const cwd: string = process.cwd() + sep;

    const lines: string[] = stack
        .split("\n")
        .splice(1)
        .map((l) => l.trim().replace("file://", "").replace(cwd, ""));

    return lines;
}

function formatStack(stack: string, opts: FormatOptions): string {
    const indent = "  ".repeat((opts?.errorLevel || 0) + 1);
    return `\n${indent}${parseStack(stack)
        .map(
            (line) =>
                `  ${line.replace(AT_TRACE_PATTERN, (m) => getColorFn("gray")(m)).replace(PARENTHESES_CONTENT_PATTERN, (_, m) => `(${getColorFn("cyan")(m)})`)}`
        )
        .join(`\n${indent}`)}`;
}

function formatError(err: unknown, opts: FormatOptions): string {
    if (!(err instanceof Error)) {
        return formatWithOptions(opts, err);
    }

    const message: string = err.message ?? formatWithOptions(opts, err);
    const stack: string = err.stack ? formatStack(err.stack, opts) : "";

    const level: number = opts?.errorLevel || 0;
    const causedPrefix: string = level > 0 ? `${"  ".repeat(level)}[cause]: ` : "";
    const causedError: string = err.cause ? `\n\n${formatError(err.cause, { ...opts, errorLevel: level + 1 })}` : "";

    return `${causedPrefix + message}\n${stack}${causedError}`;
}

export function formatTimestamp(date: Date): string {
    const _date: string = dateFormatter.format(date).replace(/\./g, "/").replace(",", "");
    return getColorFn("gray")(`[${_date}]`);
}

function createBadgeStyle(payload: LogObject, typeColor: ColorName): string {
    return getColorFn("bold")(getBgColor(typeColor)(getColorFn("black")(` ${payload.type.toUpperCase()} `)));
}

function createTextStyle(typePrefix: string, typeColor: ColorName): string {
    return getColorFn("bold")(getColorFn(typeColor)(typePrefix));
}

function formatType(payload: LogObject, isBadge: boolean): string {
    let formatter: string;
    let typeColor: ColorName;
    let prefix: string;

    if (payload.tag) {
        typeColor = "gray";
        prefix = payload.tag.toUpperCase();
        formatter = createTextStyle(prefix, typeColor);
    } else {
        typeColor = TYPE_COLOR_MAP[payload.type] as ColorName;
        prefix = TYPE_PREFIX[payload.type] || payload.type.toUpperCase();

        const simpleTextTypes = [
            "error",
            "warn",
            "info",
            "success",
            "debug",
            "trace",
            "start",
            "log",
            "silent",
            "ready",
            "box",
            "verbose",
        ];

        const useBadge: boolean =
            ["fatal", "fail"].includes(payload.type) || (!simpleTextTypes.includes(payload.type) && isBadge);

        formatter = useBadge ? createBadgeStyle(payload, typeColor) : createTextStyle(prefix, typeColor);
    }

    const visibleLength: number = stripAnsi(formatter).length;
    const padding: number = Math.max(0, 8 - visibleLength);

    return formatter + " ".repeat(padding);
}

function formatArgs(args: unknown[], opts: FormatOptions): string {
    const _args: unknown[] = args.map((arg: unknown): unknown => {
        if (arg instanceof Error && typeof arg.stack === "string") {
            return formatError(arg, opts);
        }
        return arg;
    });

    return formatWithOptions(opts, ..._args);
}

function formatPayload(payload: LogObject, opts: FormatOptions): string {
    if (payload.args[0] === "\n") {
        return "";
    }

    let [message, ...additional] = formatArgs(payload.args, opts).split("\n");

    const date: string = formatTimestamp(payload.date);
    const isLogType: boolean = payload.type === "log";
    const isBadge: boolean = (payload.badge as boolean) ?? payload.level < 2;
    const type: string = isLogType ? "" : formatType(payload, isBadge);

    if (payload.type === "trace" || payload.tag) {
        message = getColorFn("gray")(message);
    }

    let line: string;
    const format: string = isLogType
        ? [date, characterFormat(message)].join(" ")
        : [type, date, characterFormat(message)].join(" ");

    line = format;
    line += characterFormat(additional.length > 0 ? `\n${additional.join("\n")}` : "");

    return line;
}

/* -------------------------------------------------------------------------- */

export const log: ConsolaInstance = createConsola({
    level: logLevel,
    reporters: [
        {
            log(logObj: LogObject, ctx: { options: ConsolaOptions }): boolean {
                const line: string = formatPayload(logObj, {
                    columns: ctx.options.stdout?.columns || 0,
                    ...ctx.options.formatOptions,
                });

                return writeStream(
                    `${line}\n`,
                    logObj.level < 2 ? ctx.options.stderr || process.stderr : ctx.options.stdout || process.stdout
                );
            },
        },
    ],
});
