import Test from "../src/lib/Test";

export const test1 = new Test("Complex test 1", () => {
    throw new Error("error!");
});

export const test2 = new Test("Complex test 2", () => {

});