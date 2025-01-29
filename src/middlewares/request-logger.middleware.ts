import type { ColorName } from "consola/utils";
import Elysia from "elysia";
import { ClientError, ServerError } from "#/libs/error";
import { getColorFn as c, log } from "#/libs/logger";

const STATUS_COLOR_MAP: { [k in number]?: ColorName } = {
    200: "green",
    201: "green",
    204: "yellow",
    400: "yellow",
    401: "magenta",
    403: "cyan",
    404: "green",
    500: "red",
};

function formatStatus(status: string | number | undefined): string {
    if (status === undefined) {
        return "";
    }

    const color: ColorName = STATUS_COLOR_MAP[Number(status)] || "gray";
    return c(color)(status.toString());
}

function formatTime(time: number): string {
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`;
}

export function useRequestLoggerMiddleware() {
    return new Elysia({
        name: "RequestLogger",
    })
        .error({
            ClientError,
            ServerError,
        })
        .derive(
            {
                as: "scoped",
            },
            ({ headers }) => {
                return {
                    startTime: Date.now(),
                    ip: headers["x-forwarded-for"] || headers["x-real-ip"] || headers["x-client-ip"] || "",
                };
            }
        )
        .onAfterHandle({ as: "global" }, (ctx) => {
            const method: string = c("bold")(ctx.request.method.padEnd(4));
            const url: string = c("white")(new URL(ctx.request.url).pathname.padEnd(4));
            const statusCode: string = c("bold")(formatStatus(ctx.set.status));
            const duration: string = c("gray")(`${formatTime(Date.now() - (ctx.startTime || Date.now()))}`);

            log.info(`${method} ${url} ${statusCode} ${duration}`);

            log.trace(`Request received: ${ctx.request.method} ${new URL(ctx.request.url).pathname}`);
            log.trace(`Request Headers: ${c("gray")(JSON.stringify(ctx.request.headers))}`);
            log.trace(`Request Body: ${c("gray")(JSON.stringify(ctx.body))}`);
            log.trace(`Request Query: ${c("gray")(JSON.stringify(ctx.query))}`);
            log.trace(`Request Params: ${c("gray")(JSON.stringify(ctx.params))}`);
            log.trace(`Request Cookies: ${c("gray")(JSON.stringify(ctx.cookie))}`);
            log.trace(`Response sent: ${statusCode} ${c("gray")(JSON.stringify(ctx.response))}`);
        })
        .onError({ as: "global" }, (ctx) => {
            const error = ctx.error;

            const method: string = c("bold")(ctx.request.method.padEnd(4));
            const url: string = c("white")(new URL(ctx.request.url).pathname.padEnd(4));
            const statusCode: string = formatStatus(ctx.set.status);
            const duration: string = c("gray")(`${formatTime(Date.now() - (ctx.startTime || Date.now()))}`);

            log.error(`${method} ${url} ${statusCode} ${duration}`);

            log.trace(`Request received: ${ctx.request.method} ${new URL(ctx.request.url).pathname}`);
            log.trace(`Request Headers: ${c("gray")(JSON.stringify(ctx.request.headers))}`);
            log.trace(`Request Body: ${c("gray")(JSON.stringify(ctx.body))}`);
            log.trace(`Request Query: ${c("gray")(JSON.stringify(ctx.query))}`);
            log.trace(`Request Params: ${c("gray")(JSON.stringify(ctx.params))}`);
            log.trace(`Request Cookies: ${c("gray")(JSON.stringify(ctx.cookie))}`);
            log.trace(`Response sent: ${statusCode} ${c("gray")(JSON.stringify(ctx.response))}`);

            log.trace(`Error: ${JSON.stringify(error)}`);
        });
}
