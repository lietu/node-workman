import {taskManager} from "./manager"

export function TaskResult(nonce: string, result: any): void {
    taskManager.sendResult(nonce, result)
}
