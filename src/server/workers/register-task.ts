import {taskManager} from "./manager"

export async function RegisterTask(workerId: string, name: string) {
    taskManager.registerTask(workerId, name)
}
