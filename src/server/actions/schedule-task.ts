export async function ScheduleTask(name: string, when: string, args: any[]): Promise<string> {
    return Date.now().toString(16)
}
