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
const hapi_init_1 = require("./hapi-init");
const unique_id_1 = require("../unique-id");
const get_tasks_1 = require("./actions/get-tasks");
const run_task_1 = require("./actions/run-task");
const schedule_task_1 = require("./actions/schedule-task");
const unschedule_task_1 = require("./actions/unschedule-task");
const get_task_1 = require("./workers/get-task");
const register_task_1 = require("./workers/register-task");
// Connected worker count
exports.workers = 0;
hapi_init_1.getServer().then(function (server) {
    return __awaiter(this, void 0, void 0, function* () {
        /*
         * HTTP API
         */
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
        /*
         * Websocket client handler
         */
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
                                if (action === "GetTasks") {
                                    resolve(reply(get_tasks_1.GetTasks()));
                                }
                                else if (action === "RunTask") {
                                    const data = pkg;
                                    resolve(reply(yield run_task_1.RunTask(data.name, data.options)));
                                }
                                else if (action === "ScheduleTask") {
                                    const data = pkg;
                                    resolve(reply(yield schedule_task_1.ScheduleTask(data.name, data.when, data.options)));
                                }
                                else if (action === "UnscheduleTask") {
                                    const data = pkg;
                                    resolve(reply(yield unschedule_task_1.UnscheduleTask(data.id)));
                                }
                                else {
                                    resolve(reply({
                                        error: `Bad request, unknown action ${action}`
                                    }));
                                }
                            });
                        });
                    });
                }
            }
        });
        /*
         * Websocket worker handler
         */
        server.route({
            method: "POST", path: "/workers",
            config: {
                payload: { output: "data", parse: true, allow: "application/json" },
                plugins: {
                    websocket: {
                        only: true,
                        initially: false,
                        connect: (ctx) => {
                            ctx.id = unique_id_1.uniqueId();
                            exports.workers += 1;
                        },
                        disconnect: () => {
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
                                const action = pkg.action;
                                const ws = request.websocket();
                                const ctx = ws.ctx;
                                console.log(ctx.id);
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
                                resolve(reply({}));
                            });
                        });
                    });
                }
            }
        });
    });
});
//# sourceMappingURL=server.js.map