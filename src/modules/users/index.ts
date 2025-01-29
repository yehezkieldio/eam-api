import type { Prisma } from "@prisma/client";
import Elysia, { t } from "elysia";
import { db } from "#/libs/db";
import { UserPlain } from "#/prisma/prismabox/User";

const UserSelect: Partial<Prisma.UserSelect> = {
    id: true,
    fullname: true,
    email: true,
    photo: true,
    role: true,
    created_at: true,
    updated_at: true,
};

export const usersModule = new Elysia({ name: "Module.User", tags: ["Users"] }).group("/users", (api) =>
    api
        .model({
            "user.many": t.Array(t.Omit(UserPlain, ["password", "deleted_at"])),
            "user.one": t.Omit(UserPlain, ["password", "deleted_at"]),
        })
        .get(
            "/",
            async () => {
                const users = await db.user.findMany({
                    select: UserSelect,
                });

                return users;
            },
            {
                response: "user.many",
                detail: {
                    description: "View all users.",
                },
            }
        )
        .get(
            "/:id",
            async (ctx) => {
                const { id } = ctx.params;
                const user = await db.user.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        fullname: true,
                        email: true,
                        photo: true,
                        role: true,
                        created_at: true,
                        updated_at: true,
                    },
                });

                if (!user) {
                    throw ctx.error("Not Found", "User not found.");
                }

                return user;
            },
            {
                params: t.Object({
                    id: t.String({
                        description: "The ID of the user to view.",
                    }),
                }),
                response: {
                    200: "user.one",
                    404: t.String({
                        default: "User not found.",
                    }),
                },
                detail: {
                    description: "View a user by ID.",
                },
            }
        )
);
