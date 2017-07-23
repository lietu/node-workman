import {taskManager} from "../manager"

test("runs tasks", async function (): Promise<void> {
    let worker = {
        id: "1",
        work: function (options: Map<string, number>): number {
            return options["a"] + options["b"]
        }
    }

    taskManager.registerTask(worker.id, "work")

    async function runTask() {
        const task = await taskManager.getTask(worker.id)
        expect(task.name).toBe("work")
        taskManager.sendResult((task.nonce as string), worker.work(task.options))
    }

    const resultPromise = taskManager.runTask({
        name: "work",
        options: {a: 1, b: 2}
    })

    const before = taskManager.getStats()
    expect(before.pendingTasks).toBe(1)
    expect(before.processedTasks).toBe(1)
    expect(before.registeredTasks).toBe(1)
    expect(before.waitingResults).toBe(1)

    setTimeout(runTask, 0)

    const result = await resultPromise
    expect(result).toBe(3)

    const after = taskManager.getStats()
    expect(after.pendingTasks).toBe(0)
    expect(after.processedTasks).toBe(1)
    expect(after.registeredTasks).toBe(1)
    expect(after.waitingResults).toBe(0)
})
