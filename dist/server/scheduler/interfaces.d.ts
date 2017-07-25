import { Task } from '../workers/interfaces';
export interface ScheduledTask extends Task {
    id: string;
    when: number;
}
