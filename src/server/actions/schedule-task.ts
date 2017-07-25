import {manager} from '../scheduler/manager'

export async function ScheduleTask(name: string, when: string, options: any[]): Promise<string> {
    return manager.add(when, {
        name: name,
        options: options
    })
}
