import { createEnv, t } from "@jcwillox/typebox-x";

export const env = createEnv(
    t.Object({
        NAME: t.String({ default: "Enterprise Asset Management API" }),
        DESCRIPTION: t.String({ default: "API for managing enterprise assets." }),
        VERSION: t.String({ default: "unknown" }),
        NODE_ENV: t.String({ default: "development" }),
        PORT: t.Number({ default: 3000 }),
        OPENAPI_DOCUMENTATION_PATH: t.String({ default: "/reference" }),
        GIT_COMMIT: t.Optional(t.String()),
        BUILD_DATE: t.Optional(t.String()),
    })
);
