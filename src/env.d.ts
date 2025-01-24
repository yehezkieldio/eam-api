declare module "bun" {
    interface Env {
        NAME: string;
        DESCRIPTION: string;
        VERSION: string;
        PORT: number;
        GIT_COMMIT_HASH?: string;
        BUILD_TIMESTAMP?: string;
    }
}
