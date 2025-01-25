declare module "bun" {
    interface Env {
        NAME: string;
        DESCRIPTION: string;
        VERSION: string;
        PORT: number;
        GIT_COMMIT?: string;
        BUILD_DATE?: string;
    }
}
