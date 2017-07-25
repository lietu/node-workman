"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const base_storage_1 = require("./base-storage");
class NoneStorage extends base_storage_1.BaseStorage {
    constructor() {
        super(...arguments);
        this._data = [];
    }
    getUpcoming() {
        const until = this.getUpcomingTime();
        let upcoming = [];
        for (let task of this._data) {
            if (task.when <= until) {
                upcoming.push(task);
            }
            else {
                break;
            }
        }
        return upcoming;
    }
    save(task) {
        const _this = this;
        return new Promise(function (resolve) {
            const id = (Date.now() + Math.random()).toString(16);
            task.id = id;
            _this._data.push(task);
            _this._sort();
            resolve(id);
        });
    }
    delete(id) {
        const _this = this;
        return new Promise(function (resolve) {
            const len = _this._data.length;
            for (let i = 0; i < len; i += 1) {
                const task = _this._data[i];
                if (task.id === id) {
                    _this._data.splice(i, 1);
                    return resolve(true);
                }
            }
            return resolve(false);
        });
    }
    _sort() {
        this._data.sort(function (a, b) {
            return a.when - b.when;
        });
    }
}
base_storage_1.registerStorageClass("none", NoneStorage);
//# sourceMappingURL=no-storage.js.map