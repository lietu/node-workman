import * as requireDir from 'require-dir'
import {StorageInterface, getStorageClass} from './storage/base-storage'
import {ScheduledTask} from './interfaces'
import {Task} from '../workers/interfaces'
import {taskManager} from '../workers/manager'
import {log} from '../../log'

requireDir('./storage')

export class ScheduleManager {
    private _running: boolean = false
    private _storage: StorageInterface
    private _checkStorageInterval: number
    private _checkStorageTime: number = 60 * 1000
    private _tasks: ScheduledTask[] = []
    private _nextTimeout: number

    constructor() {
        this._storage = getStorageClass()
        this._checkStorageInterval = setInterval(this._checkStorage.bind(this), this._checkStorageTime)
        this._checkStorage()
    }

    async add(when: string, task: Task): Promise<string> {
        const scheduledTask = <any>task
        scheduledTask.when = this._parseWhen(when)

        const id = await this._storage.save(scheduledTask)
        const until = scheduledTask.when - Date.now()

        if (until < this._checkStorageTime) {
            // TODO: What to do while _running?
            this._tasks.push(scheduledTask)
            this._tasks.sort(ScheduleManager.sort)
            this._scheduleNext()
        }

        log.debug(`Added task ${id} for ${task.name} to be run at ${when}, which is in ${until}ms`)

        return id
    }

    async delete(id: string): Promise<boolean> {
        log.debug(`Removing task ${id}`)

        const len = this._tasks.length
        for (let i = 0; i < len; i += 1) {
            const task = this._tasks[i]
            if (task.id === id) {
                this._tasks.splice(i, 1)
                break
            }
        }

        const result = await this._storage.delete(id)
        return result
    }

    static sort(a: ScheduledTask, b: ScheduledTask) {
        return a.when - b.when
    }

    private async _runTasks() {
        this._running = true
        const _this = this
        const time = Date.now()
        const len = this._tasks.length
        let i = 0
        for (; i < len; i += 1) {
            const task = this._tasks[i]
            if (task.when > time) {
                break
            }

            await _this._storage.delete(task.id)
            log.debug(`Running scheduled task ${task.id} for ${task.name}`)
            taskManager.runTask(task)
        }

        // Remove processed tasks from memory
        if (i > 0) {
            this._tasks.splice(0, i)
        }

        this._running = false
        this._scheduleNext()
    }

    _parseWhen(when: string): number {
        return Date.parse(when)
    }

    _checkStorage() {
        const tasks = this._storage.getUpcoming().sort(ScheduleManager.sort)

        if (!this._running) {
            this._tasks = tasks
            log.info(`${this._tasks.length} upcoming tasks`)
            this._scheduleNext()
        }
    }

    _scheduleNext() {
        if (this._nextTimeout) {
            clearTimeout(this._nextTimeout)
        }

        const next = this._tasks[0]
        if (next !== undefined) {
            let until = next.when - Date.now()
            if (until < 0) {
                until = 0
            }

            log.info(`Running next tasks in ${until}ms`)
            this._nextTimeout = setTimeout(this._runTasks.bind(this), until)
        }
    }
}

export const manager = new ScheduleManager()
