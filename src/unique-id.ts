
export function uniqueId():string {
    return (Date.now() + Math.random()).toString(16)
}
