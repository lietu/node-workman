import {taskManager} from "../workers/manager"

export async function RunTask(name: string, options: any): Promise<any> {
    return taskManager.runTask({
        name: name,
        options: options
    })
}
