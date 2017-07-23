"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const manager_1 = require("./manager");
function SendResult(nonce, result) {
    manager_1.taskManager.sendResult(nonce, result);
}
exports.SendResult = SendResult;
//# sourceMappingURL=send-result.js.map