import swagger, { type ElysiaSwaggerConfig } from "@elysiajs/swagger";
import Elysia, { t } from "elysia";
import type { Server } from "elysia/universal";
import { env } from "#/env";
import { getColorFn as c, log } from "#/libs/logger";
import { buildMetadata } from "#/libs/metadata";
import { useLoggerMiddleware } from "#/middlewares/logger.middleware";
import { useResponseMapperMiddleware } from "#/middlewares/response-mapper.middleware";
import { usersModule } from "#/modules/users";

log.wrapAll();
await buildMetadata();

const healthModule = new Elysia().get(
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
            tags: ["General"],
        },
    }
);

const swaggerConfig: ElysiaSwaggerConfig<typeof env.OPENAPI_DOCUMENTATION_PATH> = {
    path: env.OPENAPI_DOCUMENTATION_PATH,
    documentation: {
        info: {
            title: env.NAME,
            description: env.DESCRIPTION,
            version: env.REVISION!,
        },
        tags: [
            {
                name: "General",
                description: "General endpoints, such as health checks.",
            },
            {
                name: "Users",
                description: "Endpoints for managing users.",
            },
        ],
    },
};

export const api = new Elysia()
    .use(useLoggerMiddleware())
    .use(useResponseMapperMiddleware())
    .use(swagger(swaggerConfig))
    .use(healthModule)
    .use(usersModule);

api.listen(env.PORT, (server: Server): void => {
    const port: string = c("cyan")(env.PORT);
    const host: string = c("cyan")(server.hostname);
    const url: string = c("gray")(server.url.toString().replace(/\/$/, ""));

    const revision: string = c("blueBright")(env.REVISION!);
    const buildDate: string = c("blueBright")(env.BUILD_DATE!);
    const documentation: string = c("gray")(url + env.OPENAPI_DOCUMENTATION_PATH);

    log.success(`${revision} (${buildDate})`);
    log.ready(`API is running on port ${port} at ${host} (${url})`);
    log.ready(`OpenAPI documentation using Scalar is available at ${documentation}`);
});
