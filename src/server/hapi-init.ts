import {config} from '../config'
import {log} from '../log'
import * as Hapi from 'hapi'

// List of things to wait for before server is ready
let wait: Promise<void>[] = []

export const server = new Hapi.Server({
    debug: {
        request: ['error']
    }
})

server.connection({
    host: config.server.host,
    port: config.server.port
})

/*
 * Register Hapi plugins
 */

wait.push(new Promise<void>(function (resolve: { (): void }) {
    server.register({
        register: require('hapi-plugin-websocket'),
    }, function (err) {
        if (err) {
            throw err
        }

        log.debug("Registered hapi-plugin-websocket")
        resolve()
    })
}))

wait.push(new Promise<void>(function (resolve: { (): void }) {
    server.register({
        register: require('hapi-async-handler'),
    }, function (err) {
        if (err) {
            throw err
        }

        log.debug("Registered hapi-async-handler")
        resolve()
    })
}))

/**
 * Get the server instance after it's done initializing
 * @returns {Promise<Server>}
 */
export async function getServer(): Promise<Hapi.Server> {
    await Promise.all(wait)
    return server
}
