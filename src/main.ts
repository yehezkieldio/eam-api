import swagger from "@elysiajs/swagger";
import { colorize } from "consola/utils";
import { Elysia } from "elysia";
import { env } from "#/env";
import { logger } from "#/middlewares/logger";
import { log } from "#/utils/logger-instance";
import { getUTCTimestamp } from "#/utils/timestamp";
import { getCompositeVersion } from "#/utils/version";

await getCompositeVersion();

if (!env.BUILD_DATE) {
    env.BUILD_DATE = getUTCTimestamp();
}

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
    .get("/health", () => {
        return {
            status: "ok",
            version: env.VERSION,
            build_date: env.BUILD_DATE,
        };
    });

api.listen(env.PORT, () => {
    const port: string = colorize("blueBright", env.PORT);
    const hostname: string = colorize("blueBright", api.server?.hostname || "localhost");
    const documentation: string = colorize("blueBright", env.OPENAPI_DOCUMENTATION_PATH);

    const version: string = colorize("blueBright", env.VERSION);
    const buildDate: string = colorize("blueBright", env.BUILD_DATE!);

    log.success(`Version and Build Date: ${version} (${buildDate})`);
    log.success(`API is running on port ${port} at ${hostname}`);
    log.success(`OpenAPI documentation using Scalar is available at ${documentation}`);
});
