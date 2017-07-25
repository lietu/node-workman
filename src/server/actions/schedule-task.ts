import {manager} from '../scheduler/manager'

export async function ScheduleTask(name: string, when: string, options: any[]): Promise<any> {
    return {
        id: await manager.add(when, {
            name: name,
            options: options
        })
    }
}
