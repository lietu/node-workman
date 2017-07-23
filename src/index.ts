import 'source-map-support/register'
import {registerRoutes} from './server/router'
import {getServer} from './server/hapi-init'
import {taskManager} from './server/workers/manager'
import {workers} from './server/router'
import {log} from './log'

// In Node v7 unhandled promise rejections will terminate the process
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', function (reason) {
        throw reason
    })
    // Avoid memory leak by adding too many listeners
    process.env.LISTENING_TO_UNHANDLED_REJECTION = "true"
}

async function run() {
    log.info("Starting node-workman")
    const server = await getServer()
    registerRoutes(server)
    await server.start()

    if (server.info) {
        log.info(`Server listening on ${server.info.uri}`)
    }


    function showStats() {
        const stats = taskManager.getStats()
        log.info(`Workers working on tasks: ${workers}`)
        log.info(`Unique tasks registered: ${stats.registeredTasks}`)
        log.info(`Tasks processed: ${stats.processedTasks}`)
        log.info(`Tasks pending processing: ${stats.pendingTasks}`)
        log.info(`Tasks waiting results: ${stats.waitingResults}`)
    }

    setInterval(showStats, 10000)
}

run()
