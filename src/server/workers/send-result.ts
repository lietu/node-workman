import {taskManager} from "./manager"

export function SendResult(nonce: string, result: any) {
    taskManager.sendResult(nonce, result)
}
