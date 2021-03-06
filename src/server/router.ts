import * as Hapi from 'hapi'
import {uniqueId} from '../unique-id'
import {GetTasks} from './actions/get-tasks'
import {RunTask} from './actions/run-task'
import {ScheduleTask} from './actions/schedule-task'
import {UnscheduleTask} from './actions/unschedule-task'
import {GetTask} from './workers/get-task'
import {RegisterTask} from './workers/register-task'
import {SendResult} from './workers/send-result'
import {taskManager} from "./workers/manager"

// Connected worker count
export let workers = 0

interface WorkerContext {
    id: string
}

interface WebSocketRequest {
    action: string
}

interface RunTaskRequest extends WebSocketRequest {
    name: string
    options: any
    nonce?: string
}

interface ScheduleTaskRequest extends WebSocketRequest {
    name: string
    when: string
    options: any
}


interface UnscheduleTaskRequest extends WebSocketRequest {
    id: string
}

/*
 * HTTP API
 */
function registerHttpApis(server: any) {
    server.route({
        method: "GET", path: "/tasks",
        handler: {
            async: async function (request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response> {
                return reply(await GetTasks())
            }
        }
    })

    server.route({
        method: "POST", path: "/task/{name}",
        handler: {
            async: async function (request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response> {
                return reply(await RunTask(request.params["name"], request.payload))
            }
        }
    })

    server.route({
        method: "POST", path: "/schedule/{when}/{name}",
        handler: {
            async: async function (request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response> {
                return reply(await ScheduleTask(request.params["name"], request.params["when"], request.payload))
            }
        }
    })

    server.route({
        method: "DELETE", path: "/scheduled/{id}",
        handler: {
            async: async function (request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response> {
                return reply(await UnscheduleTask(request.params["id"]))
            }
        }
    })
}

/*
 * WebSocket -connected clients
 */
function registerWebSocketClientApis(server: any) {
    server.route({
        method: "POST", path: "/websocket",
        config: {
            payload: {output: "data", parse: true, allow: "application/json"},
            plugins: {
                websocket: {
                    only: true,
                    initially: false
                }
            }
        },
        handler: {
            async: async function (request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response> {
                return new Promise<Hapi.Response>(async function (resolve: { (response: Hapi.Response): void }): Promise<void> {
                    const pkg = <WebSocketRequest>request.payload
                    const action = pkg.action

                    const nonce = (<any>pkg).nonce
                    let result: any = null

                    if (action === "GetTasks") {
                        result = GetTasks()
                    } else if (action === "RunTask") {
                        const data = <RunTaskRequest>pkg
                        result = await RunTask(data.name, data.options)
                    } else if (action === "ScheduleTask") {
                        const data = <ScheduleTaskRequest>pkg
                        result = await ScheduleTask(data.name, data.when, data.options)
                    } else if (action === "UnscheduleTask") {
                        const data = <UnscheduleTaskRequest>pkg
                        result = await UnscheduleTask(data.id)
                    } else {
                        result = {
                            error: `Bad request, unknown action ${action}`
                        }
                    }

                    if (nonce === undefined) {
                        resolve(reply(result))
                    } else {
                        resolve(reply({
                            nonce: nonce,
                            result: result
                        }))
                    }
                })
            }
        }
    })
}

/*
 * Workers (WebSocket)
 */
function registerWorkerApis(server: any) {
    server.route({
        method: "POST", path: "/worker",
        config: {
            payload: {output: "data", parse: true, allow: "application/json"},
            plugins: {
                websocket: {
                    only: true,
                    initially: true,
                    connect: function (): void {
                        workers += 1
                    },
                    disconnect: function (data: any): void {
                        taskManager.unregisterWorker(data.ctx.id)
                        workers -= 1
                    }
                }
            }
        },
        handler: {
            async: async function (request: Hapi.Request, reply: Hapi.ReplyNoContinue): Promise<Hapi.Response> {
                return new Promise<Hapi.Response>(async function (resolve: { (response: Hapi.Response): void }): Promise<void> {
                    const pkg = <WebSocketRequest>request.payload

                    let ctx: WorkerContext = (<any>request).websocket().ctx
                    if (pkg === null) {
                        ctx.id = uniqueId()
                        resolve(reply())
                        return
                    }

                    const action = pkg.action
                    if (action === "GetTask") {
                        resolve(reply(await GetTask(ctx.id)))
                    } else if (action === "TaskResult") {
                        resolve(reply())
                    } else if (action === "RegisterTask") {
                        const name = (<any>pkg).name
                        resolve(reply(RegisterTask(ctx.id, name)))
                    } else if (action === "SendResult") {
                        SendResult((<any>pkg).nonce, (<any>pkg).result)
                        resolve(reply())
                    } else {
                        resolve(reply())
                    }
                })
            }
        }
    })
}

export function registerRoutes(server: any) {
    registerHttpApis(server)
    registerWebSocketClientApis(server)
    registerWorkerApis(server)
}
