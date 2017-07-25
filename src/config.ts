export interface ServerConfig {
    host: string
    port: number
}

export interface Config {
    server: ServerConfig
    storageClass: string
    storageConfig: any
}

export const config: Config = {
    server: {
        host: process.env.HOST || "localhost",
        port: Number(process.env.PORT || 9999)
    },

    storageClass: "none",
    storageConfig: {}
}
