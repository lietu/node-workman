import {manager} from '../scheduler/manager'

export async function UnscheduleTask(id: string): Promise<any> {
    const result = await manager.delete(id)
    if (result) {
        return {
            result: true
        }
    } else {
        return {
            error: "Task not found."
        }
    }
}
