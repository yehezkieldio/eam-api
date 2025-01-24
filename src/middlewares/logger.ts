import {} from "consola";
import { colorize } from "consola/utils";
import Elysia from "elysia";
import { loggerInstance } from "#/utils/logger-instance";

export function logger() {
    return new Elysia()
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
            const url = new URL(ctx.request.url);
            const duration: number = Date.now() - (ctx.startTime || Date.now());

            loggerInstance.info(`${ctx.request.method} ${url.pathname} ${colorize("gray", `${duration}ms`)}`);
        })
        .onError({ as: "global" }, ({ request, error, startTime }) => {
            const url = new URL(request.url);
            const duration = Date.now() - (startTime || Date.now()) || 1;

            loggerInstance.error(`${request.method} ${url.pathname} ${colorize("gray", `${duration}ms`)}`);
            loggerInstance.error(error);
        });
}
