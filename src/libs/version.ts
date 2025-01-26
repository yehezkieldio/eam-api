import { join } from "node:path";
import { $, type BunFile } from "bun";
import type { PackageJson } from "type-fest";
import { env } from "#/env";

async function getPackageVersion(): Promise<string> {
    const path: string = join(import.meta.dir, "../../package.json");

    try {
        const file: BunFile = Bun.file(path);

        if (!file.exists()) {
            return "unknown";
        }

        const json: PackageJson = await file.json();
        return json.version ?? "unknown";
    } catch (error) {
        console.error(error instanceof Error ? `error: ${error.message}` : error);
        return "unknown";
    }
}

async function getGitHash(): Promise<string> {
    if (Bun.env.GIT_COMMIT) {
        return Bun.env.GIT_COMMIT;
    }

    try {
        const hash: string = await $`git rev-parse --short=8 HEAD`.text();

        return hash.toString().trim();
    } catch (error) {
        console.error(error instanceof Error ? `error: ${error.message}` : error);
        return "unknown";
    }
}

/**
 * Generates a composite version string by combining the package version and Git hash.
 * First checks for VERSION environment variable, then falls back to generating the string.
 *
 * @returns {Promise<string>} Combined version string in format "version-githash" (e.g. "1.0.0-a1b2c3d4e5")
 * @throws {Error} When there's an error retrieving either the package version or Git hash
 * @example
 * const version = await getCompositeVersion();
 * console.log(version); // "1.0.0-a1b2c3d4e5"
 */
export async function getCompositeVersion(): Promise<string> {
    try {
        const version: string = await getPackageVersion();
        const gitHash: string = await getGitHash();

        env.VERSION = `${version}-${gitHash}`;

        return `${version}-${gitHash}`;
    } catch (error) {
        console.error(error instanceof Error ? `error: ${error.message}` : error);
        return "unknown";
    }
}
