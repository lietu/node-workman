import {ScheduledTask} from '../interfaces'
import {config, Config} from '../../../config'

let storageClasses: Map<string, StorageInterface> = new Map<string, StorageInterface>()

export interface StorageInterface {
    getUpcoming(): ScheduledTask[]
    save(task: ScheduledTask): Promise<string>
    delete(id: string): Promise<boolean>
}

export interface StorageConstructor {
    new(config: Config): StorageInterface
}

export abstract class BaseStorage implements StorageInterface {
    private _config: Config

    constructor(config: Config) {
        this._config = config
    }

    abstract getUpcoming(): ScheduledTask[]
    abstract save(task: ScheduledTask): Promise<string>
    abstract delete(id: string): Promise<boolean>

    getUpcomingTime() {
        // Next 5 minutes
        return Date.now() + 5 * 60 * 1000
    }
}

export function registerStorageClass(name: string, constructor: StorageConstructor) {
    storageClasses[name] = constructor
}

export function getStorageClass(): StorageInterface {
    const name = config.storageClass || 'none'
    const constructor = storageClasses[name]

    if (constructor === undefined) {
        throw new Error(`Unknown storage class ${config.storageClass}`)
    }

    return new constructor(config)
}
