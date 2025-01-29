import swagger from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import type { Server } from "elysia/universal";
import { env } from "#/env";
import { getColorFn as c, log } from "#/libs/logger";
import { useLoggerMiddleware } from "#/middlewares/logger.middleware";
import { useResponseMapperMiddleware } from "#/middlewares/response-mapper.middleware";
import { usersModule } from "#/modules/(users)";

export const api = new Elysia()
    .use(useLoggerMiddleware())
    .use(useResponseMapperMiddleware())
    .use(
        swagger({
            path: env.OPENAPI_DOCUMENTATION_PATH,
            documentation: {
                info: {
                    title: env.NAME,
                    description: env.DESCRIPTION,
                    version: env.VERSION,
                },
            },
        })
    )
    .get(
        "/health",
        () => {
            return {
                status: "ok",
            };
        },
        {
            response: {
                200: t.Object({
                    status: t.String({
                        default: "ok",
                        description: "Status of the API, which should always be 'ok'.",
                    }),
                }),
            },
            detail: {
                description: "View the health status of the API.",
            },
        }
    )
    .use(usersModule);

api.listen(env.PORT, (server: Server): void => {
    const port: string = c("cyan")(env.PORT);
    const host: string = c("cyan")(server.hostname);
    const url = c("gray")(server.url.toString().replace(/\/$/, ""));

    log.ready(`API is running on port ${port} at ${host} (${url})`);
});
