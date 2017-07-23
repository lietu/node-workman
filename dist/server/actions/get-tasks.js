"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("../workers/manager");
function GetTasks() {
    return manager_1.taskManager.getTasks();
}
exports.GetTasks = GetTasks;
//# sourceMappingURL=get-tasks.js.map