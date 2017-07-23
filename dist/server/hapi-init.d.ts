import * as Hapi from 'hapi';
export declare const server: Hapi.Server;
/**
 * Get the server instance after it's done initializing
 * @returns {Promise<Server>}
 */
export declare function getServer(): Promise<Hapi.Server>;
