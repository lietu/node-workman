import {Task, Worker} from "./interfaces"
import {uniqueId} from "../../unique-id"
import {log} from "../../log"

interface RegisteredTasks extends Map<string, string[]> {
}

interface WaitingResults extends Map<string, { (result: any): void }> {
}

export interface Stats {
    registeredTasks: number
    processedTasks: number
    pendingTasks: number
    waitingResults: number
}

export class TaskManager {
    private _pendingTasks: Task[] = []
    private _waitingWorkers: Worker[] = []
    private _registeredTasks: RegisteredTasks = new Map<string, string[]>()
    private _waitingResults: WaitingResults = new Map<string, { (result: any): void }>()
    private _processedTasks: number = 0

    getStats(): Stats {
        return {
            registeredTasks: Object.keys(this._registeredTasks).length,
            processedTasks: this._processedTasks,
            pendingTasks: this._pendingTasks.length,
            waitingResults: Object.keys(this._waitingResults).length
        }
    }

    getTasks(): string[] {
        return Object.keys(this._registeredTasks)
    }

    async runTask(task: Task): Promise<any> {
        this._processedTasks += 1
        const _this = this
        return new Promise<any>(function (sendResult: { (result: any): void }) {
            task.nonce = uniqueId()
            _this._waitingResults[task.nonce] = sendResult

            const validWorkers = _this._registeredTasks[task.name]
            if (validWorkers === undefined) {
                log.info(`Got task for ${task.name} but have no valid workers`)
            } else {
                for (let i = 0; i < _this._waitingWorkers.length; i += 1) {
                    const worker = _this._waitingWorkers[i]
                    if (validWorkers.indexOf(worker.id) !== -1) {
                        // log.info(`Sending task ${task.nonce} for ${task.name} to worker ${worker.id}`)
                        _this._waitingWorkers.splice(i, 1)
                        worker.work(task)
                        return
                    }
                }
            }

            // log.info(`Task ${task.nonce} for ${task.name} pending available worker`)
            _this._pendingTasks.push(task)
        })
    }

    async getTask(workerId: string): Promise<Task> {
        let task = this._findTask(workerId)
        if (!task) {
            // log.info(`Worker ${workerId} waiting for tasks`)
            task = await this._waitTask(workerId)
        }

        // log.info(`Worker ${workerId} got task ${task.nonce} for ${task.name}`)
        return task
    }

    sendResult(nonce: string, result: any): void {
        const waiter = this._waitingResults[nonce]
        if (waiter === undefined) {
            log.error(`Got result for unknown nonce ${nonce}`)
            return
        }

        // log.info(`Got result for task ${nonce}`)
        delete this._waitingResults[nonce]
        waiter(result)
    }

    registerTask(workerId: string, name: string) {
        if (this._registeredTasks[name] === undefined) {
            this._registeredTasks[name] = []
        }

        log.info(`Worker ${workerId} registered to perform task "${name}"`)
        this._registeredTasks[name].push(workerId)
    }

    unregisterWorker(workerId: string) {
        log.info(`Unregistering worker ${workerId}`)
        for(let name in this._registeredTasks) {
            const index = this._registeredTasks[name].indexOf(workerId)
            if (index !== -1) {
                this._registeredTasks[name].splice(index, 1)
                // Just so getStats() is more accurate
                if (this._registeredTasks[name].length === 0) {
                    delete this._registeredTasks[name]
                }
            }
        }
    }

    _findTask(workerId: string): Task | undefined {
        const validTasks = this._getValidTasks(workerId)
        for (let i = 0; i < this._pendingTasks.length; i += 1) {
            let task = this._pendingTasks[i]
            if (validTasks.indexOf(task.name) !== -1) {
                this._pendingTasks.splice(i, 1)
                return task
            }
        }

        return undefined
    }

    _getValidTasks(workerId: string): string[] {
        let tasks: string[] = []
        for (let task in this._registeredTasks) {
            if (this._registeredTasks[task].indexOf(workerId) !== -1) {
                tasks.push(task)
            }
        }
        return tasks
    }

    async _waitTask(workerId: string): Promise<Task> {
        const _this = this
        return new Promise<Task>(function (resolve: { (task: Task): void }) {
            _this._waitingWorkers.push({
                id: workerId,
                work: resolve
            })
        })
    }
}

export const taskManager = new TaskManager()
