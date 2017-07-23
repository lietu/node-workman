export interface ServerConfig {
    host: string;
    port: number
}

export interface Config {
    server: ServerConfig;
}

export const config: Config = {
    server: {
        host: process.env.HOST || "localhost",
        port: Number(process.env.PORT || 9999)
    }
}
