export interface ServerConfig {
    host: string;
    port: number;
}
export interface Config {
    server: ServerConfig;
    storageClass: string;
    storageConfig: any;
}
export declare const config: Config;
