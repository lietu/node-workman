"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
function TaskResult(nonce, result) {
    manager_1.taskManager.sendResult(nonce, result);
}
exports.TaskResult = TaskResult;
//# sourceMappingURL=task-result.js.map