import Test from "../src/lib/Test";

export const test1 = new Test("Async test", expect => new Promise((resolve, reject) => {
    setTimeout(() => {
        expect(true).toBe(true);
        resolve();
    }, 250);
}));