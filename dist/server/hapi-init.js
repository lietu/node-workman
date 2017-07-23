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
const config_1 = require("../config");
const log_1 = require("../log");
const Hapi = require("hapi");
// List of things to wait for before server is ready
let wait = [];
exports.server = new Hapi.Server({
    debug: {
        request: ['error']
    }
});
exports.server.connection({
    host: config_1.config.server.host,
    port: config_1.config.server.port
});
/*
 * Register Hapi plugins
 */
wait.push(new Promise(function (resolve) {
    exports.server.register({
        register: require('hapi-plugin-websocket'),
    }, function (err) {
        if (err) {
            throw err;
        }
        log_1.log.debug("Registered hapi-plugin-websocket");
        resolve();
    });
}));
wait.push(new Promise(function (resolve) {
    exports.server.register({
        register: require('hapi-async-handler'),
    }, function (err) {
        if (err) {
            throw err;
        }
        log_1.log.debug("Registered hapi-async-handler");
        resolve();
    });
}));
/**
 * Get the server instance after it's done initializing
 * @returns {Promise<Server>}
 */
function getServer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield Promise.all(wait);
        return exports.server;
    });
}
exports.getServer = getServer;
//# sourceMappingURL=hapi-init.js.map