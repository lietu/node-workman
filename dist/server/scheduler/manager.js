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
const requireDir = require("require-dir");
const base_storage_1 = require("./storage/base-storage");
const manager_1 = require("../workers/manager");
const log_1 = require("../../log");
requireDir('./storage');
class ScheduleManager {
    constructor() {
        this._running = false;
        this._checkStorageTime = 60 * 1000;
        this._tasks = [];
        this._storage = base_storage_1.getStorageClass();
        this._checkStorageInterval = setInterval(this._checkStorage.bind(this), this._checkStorageTime);
        this._checkStorage();
    }
    add(when, task) {
        return __awaiter(this, void 0, void 0, function* () {
            const scheduledTask = task;
            scheduledTask.when = this._parseWhen(when);
            const id = yield this._storage.save(scheduledTask);
            const until = scheduledTask.when - Date.now();
            if (until < this._checkStorageTime) {
                // TODO: What to do while _running?
                this._tasks.push(scheduledTask);
                this._tasks.sort(ScheduleManager.sort);
                this._scheduleNext();
            }
            log_1.log.debug(`Added task ${id} for ${task.name} to be run at ${when}, which is in ${until}ms`);
            return id;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            log_1.log.debug(`Removing task ${id}`);
            const len = this._tasks.length;
            for (let i = 0; i < len; i += 1) {
                const task = this._tasks[i];
                if (task.id === id) {
                    this._tasks.splice(i, 1);
                    break;
                }
            }
            const result = yield this._storage.delete(id);
            return result;
        });
    }
    static sort(a, b) {
        return a.when - b.when;
    }
    _runTasks() {
        return __awaiter(this, void 0, void 0, function* () {
            this._running = true;
            const _this = this;
            const time = Date.now();
            const len = this._tasks.length;
            let i = 0;
            for (; i < len; i += 1) {
                const task = this._tasks[i];
                if (task.when > time) {
                    break;
                }
                yield _this._storage.delete(task.id);
                log_1.log.debug(`Running scheduled task ${task.id} for ${task.name}`);
                manager_1.taskManager.runTask(task);
            }
            // Remove processed tasks from memory
            if (i > 0) {
                this._tasks.splice(0, i);
            }
            this._running = false;
            this._scheduleNext();
        });
    }
    _parseWhen(when) {
        return Date.parse(when);
    }
    _checkStorage() {
        const tasks = this._storage.getUpcoming().sort(ScheduleManager.sort);
        if (!this._running) {
            this._tasks = tasks;
            log_1.log.info(`${this._tasks.length} upcoming tasks`);
            this._scheduleNext();
        }
    }
    _scheduleNext() {
        if (this._nextTimeout) {
            clearTimeout(this._nextTimeout);
        }
        const next = this._tasks[0];
        if (next !== undefined) {
            let until = next.when - Date.now();
            if (until < 0) {
                until = 0;
            }
            log_1.log.info(`Running next tasks in ${until}ms`);
            this._nextTimeout = setTimeout(this._runTasks.bind(this), until);
        }
    }
}
exports.ScheduleManager = ScheduleManager;
exports.manager = new ScheduleManager();
//# sourceMappingURL=manager.js.map