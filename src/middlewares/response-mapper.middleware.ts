import Elysia, { NotFoundError, ValidationError } from "elysia";
import {
    ClientError,
    ServerError,
    type ValidationErrorAll,
    type ValidationResult,
    type ValidationSchemaError,
} from "#/libs/error";
import type { ErrorResponse } from "#/libs/response";

export function useResponseMapperMiddleware() {
    return new Elysia({
        name: "ResponseMapper",
    })
        .onAfterHandle({ as: "global" }, (ctx) => {
            const path: string = new URL(ctx.request.url).pathname;

            // Don't map the response if the path is /health since it's a health check endpoint and should return the response as is
            if (path === "/health") {
                return ctx.response;
            }

            const message: string = "success";
            const response = ctx.response;
            const timestamp = new Date().toISOString();
            const status = ctx.set.status ?? 200;

            return {
                path,
                message,
                response,
                timestamp,
                status,
            };
        })
        .onError({ as: "global" }, (ctx) => {
            const error = ctx.error;

            const _response: ErrorResponse = {
                path: new URL(ctx.request.url).pathname,
                message: "",
                code: "",
                status: 500,
                timestamp: new Date().toISOString(),
            };

            if (error instanceof ValidationError) {
                ctx.set.status = 400;
                _response.status = 400;
                _response.message = "The request contains invalid or missing data.";

                const _details: ValidationSchemaError[] = error.all
                    .filter(
                        (item: ValidationErrorAll): item is Exclude<ValidationErrorAll, { summary: undefined }> =>
                            item.summary !== undefined
                    )
                    .map(
                        ({ schema, summary }: ValidationResult): ValidationSchemaError => ({
                            type: error.type,
                            message: summary,
                            schema,
                        })
                    );

                _response.details = _details;
            }

            if (error instanceof ClientError || error instanceof ServerError) {
                ctx.set.status = error.status;
                _response.status = error.status;
                _response.code = error.code;
                _response.message = error.message;
            }

            if (error instanceof NotFoundError) {
                ctx.set.status = 404;
                _response.status = 404;
                _response.code = "not_found";
                _response.message = "The requested resource was not found.";
            }

            return _response;
        });
}
