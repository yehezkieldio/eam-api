import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { api } from "#/main";

describe("health route", () => {
    const app = api;
    let response: Response;

    beforeEach(async () => {
        response = await app.handle(new Request("http://localhost/health"));
    });

    afterAll(() => {
        app.stop();
    });

    it("return a response", async () => {
        const responseBody = await response.text();
        const expected = JSON.stringify({ status: "ok" });
        expect(responseBody).toBe(expected);
    });

    it("return a 200 status code", () => {
        expect(response.status).toBe(200);
    });

    it("return a response with the correct content type", () => {
        const contentType = response.headers.get("content-type");
        expect(contentType).toBe("application/json;charset=utf-8");
    });
});
