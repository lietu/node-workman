"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
exports.log = new (winston.Logger)({
    level: "debug",
    transports: [
        new (winston.transports.Console)(),
    ]
});
exports.default = exports.log;
//# sourceMappingURL=log.js.map