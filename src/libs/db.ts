import { PrismaClient } from "@prisma/client";

import { env } from "#/env";
import { log } from "#/libs/logger";

const createPrismaClient = () =>
    new PrismaClient({
        log:
            env.NODE_ENV === "development"
                ? [
                      {
                          emit: "event",
                          level: "query",
                      },
                      {
                          emit: "event",
                          level: "error",
                      },
                      {
                          emit: "event",
                          level: "info",
                      },
                      {
                          emit: "event",
                          level: "warn",
                      },
                  ]
                : ["error"],
    });

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();
const logPrisma = log.withTag("PRISMA");

db.$on("query", (e) => {
    logPrisma.trace(e.query);
    logPrisma.trace(`Query took ${e.duration}ms`);
});

db.$on("info", (e) => {
    logPrisma.info(e.message);
});

db.$on("warn", (e) => {
    logPrisma.warn(e.message);
});

db.$on("error", (e) => {
    logPrisma.error(e.message);
});

if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
