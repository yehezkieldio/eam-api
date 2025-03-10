import Elysia, {} from "elysia";
import { env } from "#/env";
import { getStatusName } from "#/libs/error";
import type { ErrorResponse, SuccessResponse } from "#/libs/response";

const excludePaths: string[] = ["/health", env.OPENAPI_DOCUMENTATION_PATH];

function shouldExcludePath(path: string): boolean {
    const normalizedPath: string = path.replace(/\/+$/, "");

    return excludePaths.some((excluded: string): boolean => {
        const normalizedExcluded: string = excluded.replace(/\/+$/, "");
        return normalizedPath === normalizedExcluded || normalizedPath.startsWith(`${normalizedExcluded}/`);
    });
}

type ErrorGuard = {
    code: number;
    response: number | string;
};

export function useResponseMapperMiddleware() {
    return new Elysia({
        name: "Middleware.ResponseMapper",
    })
        .onAfterHandle({ as: "global" }, (ctx) => {
            const path: string = new URL(ctx.request.url).pathname;

            if (shouldExcludePath(path)) {
                return;
            }

            const message: string = "success";
            const timestamp: string = new Date().toISOString();
            const response = ctx.response;
            const status = ctx.set.status ?? 200;

            const _response = {
                path: path,
                message: message,
                data: response,
                status: status,
                timestamp: timestamp,
            } satisfies SuccessResponse;

            ctx.set.status = status;

            return Response.json(_response);
        })
        .onError({ as: "global" }, (ctx) => {
            const error = ctx.error as ErrorGuard;

            const _response = {
                path: new URL(ctx.request.url).pathname,
                message: "error",
                code: getStatusName(Number(error.code)),
                details: error.response,
                status: error.code,
                timestamp: new Date().toISOString(),
            } satisfies ErrorResponse;

            ctx.set.status = error.code;

            return Response.json(_response);
        });
}
