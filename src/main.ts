import { getCompositeVersion } from "#/utils/version";
await getCompositeVersion();

import swagger from "@elysiajs/swagger";
import { colorize } from "consola/utils";
import { Elysia } from "elysia";
import { logger } from "#/middlewares/logger";
import { loggerInstance } from "#/utils/logger-instance";

if (!Bun.env.NAME || !Bun.env.DESCRIPTION) {
    Bun.env.NAME = Bun.env.NAME || "Enterprise Asset Management API";
    Bun.env.DESCRIPTION = Bun.env.DESCRIPTION || "API for managing enterprise assets.";
}

const OPENAPI_DOCUMENTATION_PATH: string = "/reference";

const api = new Elysia()
    .use(logger())
    .use(
        swagger({
            path: OPENAPI_DOCUMENTATION_PATH,
            documentation: {
                info: {
                    title: Bun.env.NAME,
                    description: Bun.env.DESCRIPTION,
                    version: Bun.env.VERSION,
                },
            },
        })
    )
    .get("/", () => {
        return "Hello, World!";
    });

api.listen(Bun.env.PORT, () => {
    loggerInstance.success(
        `API is running on port ${colorize("blueBright", Number(api.server?.port))} at ${colorize("blueBright", String(api.server?.hostname))}`
    );
    loggerInstance.success(
        `OpenAPI documentation using Scalar is available at ${colorize("blueBright", OPENAPI_DOCUMENTATION_PATH)}`
    );
});
