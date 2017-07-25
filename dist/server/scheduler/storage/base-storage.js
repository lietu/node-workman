"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("../../../config");
let storageClasses = new Map();
class BaseStorage {
    constructor(config) {
        this._config = config;
    }
    getUpcomingTime() {
        // Next 5 minutes
        return Date.now() + 5 * 60 * 1000;
    }
}
exports.BaseStorage = BaseStorage;
function registerStorageClass(name, constructor) {
    storageClasses[name] = constructor;
}
exports.registerStorageClass = registerStorageClass;
function getStorageClass() {
    const name = config_1.config.storageClass || 'none';
    const constructor = storageClasses[name];
    if (constructor === undefined) {
        throw new Error(`Unknown storage class ${config_1.config.storageClass}`);
    }
    return new constructor(config_1.config);
}
exports.getStorageClass = getStorageClass;
//# sourceMappingURL=base-storage.js.map