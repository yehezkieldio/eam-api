import { $ } from "bun";
import { env } from "#/env";
import packageJson from "../../package.json";

async function getGitHash(): Promise<string> {
    if (env.GIT_COMMIT !== "unknown") {
        return env.GIT_COMMIT;
    }

    try {
        const hash: string = await $`git rev-parse --short=8 HEAD`.text();

        return hash.toString().trim();
    } catch (error) {
        console.error(error instanceof Error ? `error: ${error.message}` : error);
        return "unknown";
    }
}

export async function buildMetadata() {
    if (env.BUILD_DATE === "unknown") {
        env.BUILD_DATE = new Date().toISOString();
    }

    if (env.GIT_COMMIT === "unknown") {
        env.GIT_COMMIT = await getGitHash();
    }

    if (!env.VERSION || env.VERSION === "unknown") {
        env.VERSION = packageJson.version ?? "0.0.0";
    }

    if (!env.REVISION || env.REVISION === "unknown") {
        env.REVISION = `${env.VERSION}-${env.NODE_ENV}+${env.GIT_COMMIT}`;
    }
}
