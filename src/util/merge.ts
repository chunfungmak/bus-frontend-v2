export function merge<T> (left: T[], right: T[]): T[]  {
    let arr: T[] = [];
    while (left.length && right.length) {
        if (left.length >= right.length) {
            arr.push(left.shift()!);
        } else {
            arr.push(right.shift()!);
        }
    }
    return [...arr, ...left, ...right];
};