declare module "bun" {
    interface Env {
        NAME: string;
        DESCRIPTION: string;
        VERSION: string;
        PORT: number;
        OPENAPI_DOCUMENTATION_PATH?: string;
        GIT_COMMIT?: string;
        BUILD_DATE?: string;
    }
}
