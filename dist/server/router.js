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
const unique_id_1 = require("../unique-id");
const get_tasks_1 = require("./actions/get-tasks");
const run_task_1 = require("./actions/run-task");
const schedule_task_1 = require("./actions/schedule-task");
const unschedule_task_1 = require("./actions/unschedule-task");
const get_task_1 = require("./workers/get-task");
const register_task_1 = require("./workers/register-task");
const send_result_1 = require("./workers/send-result");
const manager_1 = require("./workers/manager");
// Connected worker count
exports.workers = 0;
/*
 * HTTP API
 */
function registerHttpApis(server) {
    server.route({
        method: "GET", path: "/tasks",
        handler: {
            async: function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    return reply(yield get_tasks_1.GetTasks());
                });
            }
        }
    });
    server.route({
        method: "POST", path: "/task/{name}",
        handler: {
            async: function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    return reply(yield run_task_1.RunTask(request.params["name"], request.payload));
                });
            }
        }
    });
    server.route({
        method: "POST", path: "/schedule/{when}/{name}",
        handler: {
            async: function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    return reply(yield schedule_task_1.ScheduleTask(request.params["name"], request.params["when"], request.payload));
                });
            }
        }
    });
    server.route({
        method: "DELETE", path: "/scheduled/{id}",
        handler: {
            async: function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    return reply(yield unschedule_task_1.UnscheduleTask(request.params["id"]));
                });
            }
        }
    });
}
/*
 * WebSocket -connected clients
 */
function registerWebSocketClientApis(server) {
    server.route({
        method: "POST", path: "/websocket",
        config: {
            payload: { output: "data", parse: true, allow: "application/json" },
            plugins: {
                websocket: {
                    only: true,
                    initially: false
                }
            }
        },
        handler: {
            async: function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise(function (resolve) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const pkg = request.payload;
                            const action = pkg.action;
                            const nonce = pkg.nonce;
                            let result = null;
                            if (action === "GetTasks") {
                                result = get_tasks_1.GetTasks();
                            }
                            else if (action === "RunTask") {
                                const data = pkg;
                                result = yield run_task_1.RunTask(data.name, data.options);
                            }
                            else if (action === "ScheduleTask") {
                                const data = pkg;
                                result = yield schedule_task_1.ScheduleTask(data.name, data.when, data.options);
                            }
                            else if (action === "UnscheduleTask") {
                                const data = pkg;
                                result = yield unschedule_task_1.UnscheduleTask(data.id);
                            }
                            else {
                                result = {
                                    error: `Bad request, unknown action ${action}`
                                };
                            }
                            if (nonce === undefined) {
                                resolve(reply(result));
                            }
                            else {
                                resolve(reply({
                                    nonce: nonce,
                                    result: result
                                }));
                            }
                        });
                    });
                });
            }
        }
    });
}
/*
 * Workers (WebSocket)
 */
function registerWorkerApis(server) {
    server.route({
        method: "POST", path: "/worker",
        config: {
            payload: { output: "data", parse: true, allow: "application/json" },
            plugins: {
                websocket: {
                    only: true,
                    initially: true,
                    connect: function () {
                        exports.workers += 1;
                    },
                    disconnect: function (data) {
                        manager_1.taskManager.unregisterWorker(data.ctx.id);
                        exports.workers -= 1;
                    }
                }
            }
        },
        handler: {
            async: function (request, reply) {
                return __awaiter(this, void 0, void 0, function* () {
                    return new Promise(function (resolve) {
                        return __awaiter(this, void 0, void 0, function* () {
                            const pkg = request.payload;
                            let ctx = request.websocket().ctx;
                            if (pkg === null) {
                                ctx.id = unique_id_1.uniqueId();
                                resolve(reply());
                                return;
                            }
                            const action = pkg.action;
                            if (action === "GetTask") {
                                resolve(reply(yield get_task_1.GetTask(ctx.id)));
                            }
                            else if (action === "TaskResult") {
                                resolve(reply());
                            }
                            else if (action === "RegisterTask") {
                                const name = pkg.name;
                                resolve(reply(register_task_1.RegisterTask(ctx.id, name)));
                            }
                            else if (action === "SendResult") {
                                send_result_1.SendResult(pkg.nonce, pkg.result);
                                resolve(reply());
                            }
                            else {
                                resolve(reply());
                            }
                        });
                    });
                });
            }
        }
    });
}
function registerRoutes(server) {
    registerHttpApis(server);
    registerWebSocketClientApis(server);
    registerWorkerApis(server);
}
exports.registerRoutes = registerRoutes;
//# sourceMappingURL=router.js.map