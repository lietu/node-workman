import { ScheduledTask } from '../interfaces';
import { Config } from '../../../config';
export interface StorageInterface {
    getUpcoming(): ScheduledTask[];
    save(task: ScheduledTask): Promise<string>;
    delete(id: string): Promise<boolean>;
}
export interface StorageConstructor {
    new (config: Config): StorageInterface;
}
export declare abstract class BaseStorage implements StorageInterface {
    private _config;
    constructor(config: Config);
    abstract getUpcoming(): ScheduledTask[];
    abstract save(task: ScheduledTask): Promise<string>;
    abstract delete(id: string): Promise<boolean>;
    getUpcomingTime(): number;
}
export declare function registerStorageClass(name: string, constructor: StorageConstructor): void;
export declare function getStorageClass(): StorageInterface;
