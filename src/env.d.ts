declare module "bun" {
    interface Env {
        NAME: string;
        DESCRIPTION: string;
        VERSION: string;
        PORT: number;
    }
}
