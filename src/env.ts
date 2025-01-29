import { createEnv, t } from "@jcwillox/typebox-x";

export const env = createEnv(
    t.Object({
        NAME: t.String({ default: "Enterprise Asset Management API" }),
        DESCRIPTION: t.String({ default: "API for managing enterprise assets." }),
        VERSION: t.String({ default: "unknown" }),
        REVISION: t.Optional(t.String({ default: "unknown" })),
        NODE_ENV: t.String({ default: "development" }),
        PORT: t.Number({ default: 3000 }),
        OPENAPI_DOCUMENTATION_PATH: t.String({ default: "/reference" }),
        TRACE_LOG: t.Optional(t.Boolean({ default: false })),
        GIT_COMMIT: t.String({ default: "unknown" }),
        BUILD_DATE: t.Optional(t.String({ default: "unknown" })),
        /**
         * Whether to reorder the log line to be more readable.
         * If true, the log line will be [LEVEL] [DATE] [MESSAGE].
         * If false, the log line will be [DATE] [LEVEL] [MESSAGE].
         */
        REORDER_LOG_LINE: t.Optional(t.Boolean({ default: false })),
    })
);
