import { join } from "node:path";
import { $, type BunFile } from "bun";
import type { PackageJson } from "type-fest";

/**
 * Retrieves the version string from the project's package.json file.
 *
 * @returns {Promise<string>} The version string from package.json, or "unknown" if not found
 * @throws {Error} When there's an error reading or parsing the package.json file
 * @example
 * const version = await getPackageVersion();
 * console.log(version); // "1.0.0"
 */
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

/**
 * Retrieves the short Git commit hash of the current HEAD.
 * Executes a git command to get the first 10 characters of the current commit hash.
 *
 * @returns {Promise<string>} A 10-character Git commit hash, or "unknown" if not available
 * @throws {Error} When there's an error executing the git command or repository is not available
 * @example
 * const hash = await getGitHash();
 * console.log(hash); // "a1b2c3d4e5"
 */
async function getGitHash(): Promise<string> {
    try {
        const hash: string = await $`git rev-parse --short=10 HEAD`.text();

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
    if (Bun.env.VERSION) {
        return Bun.env.VERSION;
    }

    try {
        const version: string = await getPackageVersion();
        const gitHash: string = await getGitHash();

        Bun.env.VERSION = `${version}-${gitHash}`;

        return `${version}-${gitHash}`;
    } catch (error) {
        console.error(error instanceof Error ? `error: ${error.message}` : error);
        return "unknown";
    }
}
