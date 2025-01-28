import { type Static, t } from "elysia";

const BaseResponseSchema = t.Object({
    path: t.String(),
    message: t.String(),
    timestamp: t.String(),
});

export const SuccessResponseSchema = t.Composite([
    BaseResponseSchema,
    t.Object({
        data: t.Unknown(),
        status: t.Union([t.Number(), t.String()]),
    }),
]);

export type SuccessResponse = Static<typeof SuccessResponseSchema>;

export const ErrorResponseSchema = t.Composite([
    BaseResponseSchema,
    t.Object({
        details: t.Optional(t.Unknown()),
        status: t.Number(),
        code: t.String(),
        message: t.String(),
    }),
]);

export type ErrorResponse = Static<typeof ErrorResponseSchema>;
