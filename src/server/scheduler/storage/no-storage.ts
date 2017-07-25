import {BaseStorage, registerStorageClass} from './base-storage'
import {ScheduledTask} from '../interfaces'

interface ScheduledTaskStore extends Array<ScheduledTask> {
}

class NoneStorage extends BaseStorage {
    private _data: ScheduledTaskStore = []

    getUpcoming(): ScheduledTask[] {
        const until = this.getUpcomingTime()
        let upcoming: ScheduledTask[] = []

        for (let task of this._data) {
            if (task.when <= until) {
                upcoming.push(task)
            } else {
                break
            }
        }

        return upcoming
    }

    save(task: ScheduledTask): Promise<string> {
        const _this = this
        return new Promise<string>(function (resolve: { (id: string): void }) {
            const id = (Date.now() + Math.random()).toString(16)
            task.id = id
            _this._data.push(task)
            _this._sort()
            resolve(id)
        })
    }

    delete(id: string): Promise<boolean> {
        const _this = this
        return new Promise<boolean>(function (resolve: { (found: boolean): void }): void {
            const len = _this._data.length
            for (let i = 0; i < len; i += 1) {
                const task = _this._data[i]
                if (task.id === id) {
                    _this._data.splice(i, 1)
                    return resolve(true)
                }
            }
            return resolve(false)
        })
    }

    private _sort() {
        this._data.sort(function (a: ScheduledTask, b: ScheduledTask): number {
            return a.when - b.when
        })
    }
}

registerStorageClass("none", NoneStorage)
