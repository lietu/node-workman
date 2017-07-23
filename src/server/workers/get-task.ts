import {Task} from "./interfaces"
import {taskManager} from "./manager"

export async function GetTask(id: string): Promise<Task> {
    return await taskManager.getTask(id)
}
