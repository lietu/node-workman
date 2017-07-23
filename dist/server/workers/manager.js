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
const unique_id_1 = require("../../unique-id");
const log_1 = require("../../log");
class TaskManager {
    constructor() {
        this._pendingTasks = [];
        this._waitingWorkers = [];
        this._registeredTasks = new Map();
        this._waitingResults = new Map();
        this._processedTasks = 0;
    }
    getStats() {
        return {
            registeredTasks: Object.keys(this._registeredTasks).length,
            processedTasks: this._processedTasks,
            pendingTasks: this._pendingTasks.length,
            waitingResults: Object.keys(this._waitingResults).length
        };
    }
    getTasks() {
        return Object.keys(this._registeredTasks);
    }
    runTask(task) {
        return __awaiter(this, void 0, void 0, function* () {
            this._processedTasks += 1;
            const _this = this;
            return new Promise(function (sendResult) {
                task.nonce = unique_id_1.uniqueId();
                _this._waitingResults[task.nonce] = sendResult;
                const validWorkers = _this._registeredTasks[task.name];
                if (validWorkers === undefined) {
                    log_1.log.info(`Got task for ${task.name} but have no valid workers`);
                }
                else {
                    for (let i = 0; i < _this._waitingWorkers.length; i += 1) {
                        const worker = _this._waitingWorkers[i];
                        if (validWorkers.indexOf(worker.id) !== -1) {
                            // log.info(`Sending task ${task.nonce} for ${task.name} to worker ${worker.id}`)
                            _this._waitingWorkers.splice(i, 1);
                            worker.work(task);
                            return;
                        }
                    }
                }
                // log.info(`Task ${task.nonce} for ${task.name} pending available worker`)
                _this._pendingTasks.push(task);
            });
        });
    }
    getTask(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            let task = this._findTask(workerId);
            if (!task) {
                // log.info(`Worker ${workerId} waiting for tasks`)
                task = yield this._waitTask(workerId);
            }
            // log.info(`Worker ${workerId} got task ${task.nonce} for ${task.name}`)
            return task;
        });
    }
    sendResult(nonce, result) {
        const waiter = this._waitingResults[nonce];
        if (waiter === undefined) {
            log_1.log.error(`Got result for unknown nonce ${nonce}`);
            return;
        }
        // log.info(`Got result for task ${nonce}`)
        delete this._waitingResults[nonce];
        waiter(result);
    }
    registerTask(workerId, name) {
        if (this._registeredTasks[name] === undefined) {
            this._registeredTasks[name] = [];
        }
        log_1.log.info(`Worker ${workerId} registered to perform task "${name}"`);
        this._registeredTasks[name].push(workerId);
    }
    unregisterWorker(workerId) {
        log_1.log.info(`Unregistering worker ${workerId}`);
        for (let name in this._registeredTasks) {
            const index = this._registeredTasks[name].indexOf(workerId);
            if (index !== -1) {
                this._registeredTasks[name].splice(index, 1);
                // Just so getStats() is more accurate
                if (this._registeredTasks[name].length === 0) {
                    delete this._registeredTasks[name];
                }
            }
        }
    }
    _findTask(workerId) {
        const validTasks = this._getValidTasks(workerId);
        for (let i = 0; i < this._pendingTasks.length; i += 1) {
            let task = this._pendingTasks[i];
            if (validTasks.indexOf(task.name) !== -1) {
                this._pendingTasks.splice(i, 1);
                return task;
            }
        }
        return undefined;
    }
    _getValidTasks(workerId) {
        let tasks = [];
        for (let task in this._registeredTasks) {
            if (this._registeredTasks[task].indexOf(workerId) !== -1) {
                tasks.push(task);
            }
        }
        return tasks;
    }
    _waitTask(workerId) {
        return __awaiter(this, void 0, void 0, function* () {
            const _this = this;
            return new Promise(function (resolve) {
                _this._waitingWorkers.push({
                    id: workerId,
                    work: resolve
                });
            });
        });
    }
}
exports.TaskManager = TaskManager;
exports.taskManager = new TaskManager();
//# sourceMappingURL=manager.js.map