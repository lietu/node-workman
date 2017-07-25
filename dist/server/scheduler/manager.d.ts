import { ScheduledTask } from './interfaces';
import { Task } from '../workers/interfaces';
export declare class ScheduleManager {
    private _running;
    private _storage;
    private _checkStorageInterval;
    private _checkStorageTime;
    private _tasks;
    private _nextTimeout;
    constructor();
    add(when: string, task: Task): Promise<string>;
    delete(id: string): Promise<boolean>;
    static sort(a: ScheduledTask, b: ScheduledTask): number;
    private _runTasks();
    _parseWhen(when: string): number;
    _checkStorage(): void;
    _scheduleNext(): void;
}
export declare const manager: ScheduleManager;
