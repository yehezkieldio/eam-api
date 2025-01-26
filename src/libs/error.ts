import type { ValueErrorIterator, ValueErrorType } from "@sinclair/typebox/errors";
import type { TSchema } from "elysia";

export const ErrorStatus = {
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    URITooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HTTPVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
} as const;

export type ErrorStatus = (typeof ErrorStatus)[keyof typeof ErrorStatus];
export type ErrorStatusKey = keyof typeof ErrorStatus;

function getErrorStatusFromKey(statusCode: number): ErrorStatusKey {
    return Object.keys(ErrorStatus).find((key) => ErrorStatus[key as ErrorStatusKey] === statusCode) as ErrorStatusKey;
}

function toSnakeCase(status: ErrorStatusKey): string {
    return status
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase()
        .replace(/^_/, "");
}

/* -------------------------------------------------------------------------- */

export interface ErrorResponse {
    code: number;
    error: string;
    message: string;
    details?: unknown;
    timestamp: string;
}

export const initialErrorResponse: ErrorResponse = {
    code: 500,
    error: "internal_server_error",
    message: "An unexpected error occurred, please contact an administrator or try again later.",
    timestamp: new Date().toISOString(),
};

/* -------------------------------------------------------------------------- */

export class ClientError extends Error {
    code = "CLIENT_ERROR";
    status = 400;
    error = "";

    constructor(status: ErrorStatus, message?: string) {
        super(message ?? "CLIENT_ERROR");

        this.status = status;
        this.error = toSnakeCase(getErrorStatusFromKey(status));
    }
}

export class ServerError extends Error {
    code = "SERVER_ERROR";
    status = 400;
    error = "";

    constructor(status: ErrorStatus, message?: string) {
        super(message ?? "SERVER_ERROR");

        this.status = status;
        this.error = toSnakeCase(getErrorStatusFromKey(status));
    }
}

/* -------------------------------------------------------------------------- */

export type ValidationErrorTypeCheck = {
    summary: string;
    type: ValueErrorType;
    message: string;
    schema: TSchema;
    path: string;
    value: unknown;
    errors: ValueErrorIterator[];
};

export type ValidationErrorDetail = {
    type: string;
    message: string;
    schema: TSchema;
};

export type ValidationErrorElement = { summary: undefined } | ValidationErrorTypeCheck;

export type ValidationErrorAll = Exclude<Element, { summary: undefined }>[];
