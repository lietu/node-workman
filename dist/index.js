"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const router_1 = require("./server/router");
const hapi_init_1 = require("./server/hapi-init");
const manager_1 = require("./server/workers/manager");
const router_2 = require("./server/router");
const log_1 = require("./log");
// In Node v7 unhandled promise rejections will terminate the process
if (!process.env.LISTENING_TO_UNHANDLED_REJECTION) {
    process.on('unhandledRejection', function (reason) {
        throw reason;
    });
    // Avoid memory leak by adding too many listeners
    process.env.LISTENING_TO_UNHANDLED_REJECTION = "true";
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        log_1.log.info("Starting node-workman");
        const server = yield hapi_init_1.getServer();
        router_1.registerRoutes(server);
        yield server.start();
        if (server.info) {
            log_1.log.info(`Server listening on ${server.info.uri}`);
        }
        function showStats() {
            const stats = manager_1.taskManager.getStats();
            log_1.log.info(`Workers working on tasks: ${router_2.workers}`);
            log_1.log.info(`Unique tasks registered: ${stats.registeredTasks}`);
            log_1.log.info(`Tasks processed: ${stats.processedTasks}`);
            log_1.log.info(`Tasks pending processing: ${stats.pendingTasks}`);
            log_1.log.info(`Tasks waiting results: ${stats.waitingResults}`);
        }
        setInterval(showStats, 10000);
    });
}
run();
//# sourceMappingURL=index.js.map