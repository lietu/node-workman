import { Task } from "./interfaces";
export interface Stats {
    registeredTasks: number;
    processedTasks: number;
    pendingTasks: number;
    waitingResults: number;
}
export declare class TaskManager {
    private _pendingTasks;
    private _waitingWorkers;
    private _registeredTasks;
    private _waitingResults;
    private _processedTasks;
    getStats(): Stats;
    getTasks(): string[];
    runTask(task: Task): Promise<any>;
    getTask(workerId: string): Promise<Task>;
    sendResult(nonce: string, result: any): void;
    registerTask(workerId: string, name: string): void;
    unregisterWorker(workerId: string): void;
    _findTask(workerId: string): Task | undefined;
    _getValidTasks(workerId: string): string[];
    _waitTask(workerId: string): Promise<Task>;
}
export declare const taskManager: TaskManager;
