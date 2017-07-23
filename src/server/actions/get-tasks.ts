import {taskManager} from "../workers/manager"

export function GetTasks(): string[] {
    return taskManager.getTasks()
}
