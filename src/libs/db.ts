import { PrismaClient } from "@prisma/client";

import { env } from "#/env";
import { log } from "#/libs/logger";

const createPrismaClient = () =>
    new PrismaClient({
        // log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
        log: [
            {
                emit: "event",
                level: "query",
            },
            {
                emit: "stdout",
                level: "error",
            },
            {
                emit: "stdout",
                level: "info",
            },
            {
                emit: "stdout",
                level: "warn",
            },
        ],
    });

const globalForPrisma = globalThis as unknown as {
    prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();

db.$on("query", (e) => {
    log.trace(`Prisma Query: ${e.query}`);
    log.trace(`Prisma Params: ${e.params}`);
    log.trace(`Prisma Duration: ${e.duration}ms`);
});

if (env.NODE_ENV !== "production") {
    globalForPrisma.prisma = db;
}
