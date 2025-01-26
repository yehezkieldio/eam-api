import type { ConsolaInstance } from "consola";
import type { ColorName } from "consola/utils";
import Elysia, { NotFoundError, ValidationError } from "elysia";
import {
    ClientError,
    type ErrorResponse,
    ErrorStatus,
    ServerError,
    type ValidationErrorDetail,
    type ValidationErrorElement,
    type ValidationErrorTypeCheck,
} from "#/libs/error";
import { getColorFn, logging } from "#/libs/logging";

const STATUS_COLOR_MAP: { [k in number]?: ColorName } = {
    200: "green",
    201: "green",
    204: "yellow",
    400: "yellow",
    401: "magenta",
    403: "cyan",
    404: "green",
    500: "red",
};

function formatStatus(status: string | number | undefined): string {
    if (status === undefined) {
        return "";
    }

    const color: ColorName = STATUS_COLOR_MAP[Number(status)] || "gray";
    return getColorFn(color)(status.toString());
}

function formatTime(time: number): string {
    return time < 1000 ? `${time}ms` : `${(time / 1000).toFixed(2)}s`;
}

const initialErrorResponse: ErrorResponse = {
    code: 500,
    error: "internal_server_error",
    message: "An unexpected error occurred, please contact an administrator or try again later.",
    timestamp: new Date().toISOString(),
};

export function logger() {
    return new Elysia()
        .decorate("log", logging)
        .decorate("initialErrorResponse", initialErrorResponse)
        .decorate("errorStatus", ErrorStatus)
        .error({
            ClientError,
            ServerError,
        })
        .derive(
            {
                as: "scoped",
            },
            ({ headers }) => {
                return {
                    startTime: Date.now(),
                    ip: headers["x-forwarded-for"] || headers["x-real-ip"] || headers["x-client-ip"] || "",
                };
            }
        )
        .onAfterHandle({ as: "global" }, (ctx) => {
            const log: ConsolaInstance = ctx.log;

            const method: string = getColorFn("bold")(ctx.request.method.padEnd(4));
            const url: string = getColorFn("white")(new URL(ctx.request.url).pathname.padEnd(4));
            const statusCode: string = getColorFn("bold")(formatStatus(ctx.set.status));
            const duration: string = getColorFn("gray")(`${formatTime(Date.now() - (ctx.startTime || Date.now()))}`);

            log.info(`${method} ${url} ${statusCode} ${duration}`);

            log.trace(`Request received: ${ctx.request.method} ${new URL(ctx.request.url).pathname}`);
            log.trace(`Request Headers: ${getColorFn("gray")(JSON.stringify(ctx.request.headers))}`);
            log.trace(`Request Body: ${getColorFn("gray")(JSON.stringify(ctx.body))}`);
            log.trace(`Request Query: ${getColorFn("gray")(JSON.stringify(ctx.query))}`);
            log.trace(`Request Params: ${getColorFn("gray")(JSON.stringify(ctx.params))}`);
            log.trace(`Request Cookies: ${getColorFn("gray")(JSON.stringify(ctx.cookie))}`);
            log.trace(`Response sent: ${statusCode} ${getColorFn("gray")(JSON.stringify(ctx.response))}`);
        })
        .onError({ as: "global" }, (ctx) => {
            const log: ConsolaInstance = ctx.log;
            const data: ErrorResponse = ctx.initialErrorResponse;
            const error = ctx.error;

            const method: string = getColorFn("bold")(ctx.request.method.padEnd(4));
            const url: string = getColorFn("white")(new URL(ctx.request.url).pathname.padEnd(4));
            let statusCode: string = formatStatus(ctx.set.status);
            const duration: string = getColorFn("gray")(`${formatTime(Date.now() - (ctx.startTime || Date.now()))}`);

            if (error instanceof ValidationError) {
                ctx.set.status = 400;

                data.code = 400;
                data.error = "bad_request";
                data.message = "The request contains invalid or missing data.";
                data.timestamp = new Date().toISOString();

                const _details: ValidationErrorDetail[] = error.all
                    .filter(
                        (
                            item: ValidationErrorElement
                        ): item is Exclude<ValidationErrorElement, { summary: undefined }> => item.summary !== undefined
                    )
                    .map(
                        ({ schema, summary }: ValidationErrorTypeCheck): ValidationErrorDetail => ({
                            type: error.type,
                            message: summary,
                            schema,
                        })
                    );

                data.details = _details;
            }

            if (error instanceof ClientError) {
                ctx.set.status = error.status;

                data.code = error.status;
                data.error = error.error;
                data.message = error.message;
                data.timestamp = new Date().toISOString();
            }

            if (error instanceof ServerError) {
                ctx.set.status = error.status;

                data.code = error.status;
                data.error = error.error;
                data.message = error.message;
                data.timestamp = new Date().toISOString();
            }

            if (error instanceof NotFoundError) {
                ctx.set.status = 404;

                data.code = 404;
                data.error = "not_found";
                data.message = "The requested resource was not found.";
                data.timestamp = new Date().toISOString();
            }

            statusCode = getColorFn("bold")(formatStatus(data.code));

            log.error(`${method} ${url} ${statusCode} ${duration}`);

            log.trace(`Request received: ${ctx.request.method} ${new URL(ctx.request.url).pathname}`);
            log.trace(`Request Headers: ${getColorFn("gray")(JSON.stringify(ctx.request.headers))}`);
            log.trace(`Request Body: ${getColorFn("gray")(JSON.stringify(ctx.body))}`);
            log.trace(`Request Query: ${getColorFn("gray")(JSON.stringify(ctx.query))}`);
            log.trace(`Request Params: ${getColorFn("gray")(JSON.stringify(ctx.params))}`);
            log.trace(`Request Cookies: ${getColorFn("gray")(JSON.stringify(ctx.cookie))}`);
            log.trace(`Response sent: ${statusCode} ${getColorFn("gray")(JSON.stringify(ctx.response))}`);

            log.trace(`Error: ${JSON.stringify(error)}`);

            return Response.json(data);
        });
}
