import swagger from "@elysiajs/swagger";
import { Elysia, t } from "elysia";
import type { Server } from "elysia/universal";
import { env } from "#/env";
import { getColorFn, logging as log } from "#/libs/logging";
import { getCompositeVersion } from "#/libs/version";
import { logger } from "#/middlewares/logger";

await getCompositeVersion();

const api = new Elysia()
    .use(logger())
    .use(
        swagger({
            path: env.OPENAPI_DOCUMENTATION_PATH,
            documentation: {
                info: {
                    title: env.NAME,
                    description: Bun.env.DESCRIPTION,
                    version: env.VERSION,
                },
            },
        })
    )
    .post("/error-body/:id", () => "Hello World!", {
        body: t.Object({
            name: t.String({
                error: "name is required and must be a string",
            }),
            profession: t.String({
                error: "profession is required and must be a string",
            }),
        }),
        params: t.Object({
            id: t.Numeric({
                error: "id is required and must be a number",
            }),
        }),
    })
    .get(
        "/health",
        () => {
            return {
                status: "ok",
                version: env.VERSION,
                build_date: env.BUILD_DATE || new Date().toISOString(),
            };
        },
        {
            response: {
                200: t.Object({
                    status: t.String({
                        description: "Status of the API, which should always be 'ok'.",
                    }),
                    version: t.String({
                        description: "Combination of the semantic version and the Git commit hash.",
                    }),
                    build_date: t.String({
                        description: "Date and time the API was built or deployed.",
                    }),
                }),
            },
            detail: {
                description: "View the health status of the API with version and build date.",
            },
        }
    );

api.listen(env.PORT, (server: Server) => {
    const port: string = getColorFn("cyan")(env.PORT);
    const host: string = getColorFn("cyan")(server.hostname);
    const url = getColorFn("gray")(server.url.toString().replace(/\/$/, ""));

    const version: string = getColorFn("bold")(getColorFn("cyan")(`v${env.VERSION}`));
    const buildDate: string = getColorFn("gray")(env.BUILD_DATE!);

    const documentation: string = getColorFn("gray")(url + env.OPENAPI_DOCUMENTATION_PATH);

    log.success(`${version} (${buildDate})`);
    log.ready(`API is running on port ${port} at ${host} (${url})`);
    log.ready(`OpenAPI documentation using Scalar is available at ${documentation}`);
});
