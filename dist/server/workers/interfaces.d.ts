export interface Task {
    name: string;
    options: any;
    nonce?: string;
}
export interface WorkerConnection {
    ws: WebSocket;
    ctx: WorkerContext;
}
export interface WorkerContext {
    id: string;
}
export interface Worker {
    id: string;
    work: {
        (task: Task): void;
    };
}
