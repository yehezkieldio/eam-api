import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";

new Elysia()
    .use(
        swagger({
            documentation: {
                info: {
                    title: "Enterprise Asset Management API",
                    version: "1.0.0",
                    description: "API for managing enterprise assets",
                },
                tags: [
                    {
                        name: "User",
                        description: "User routes",
                    },
                    {
                        name: "Auth",
                        description: "Authentication routes",
                    },
                ],
            },
        })
    )
    .listen(3000);
