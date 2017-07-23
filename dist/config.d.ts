export interface ServerConfig {
    host: string;
    port: number;
}
export interface Config {
    server: ServerConfig;
}
export declare const config: Config;
