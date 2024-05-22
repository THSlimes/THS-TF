import { ExpectFunction, ValueAssertion } from "./assertions";

class Test {

    public readonly name:string;
    private readonly funct:Test.Function

    public constructor(name:string, funct:Test.Function) {
        this.name = name;
        this.funct = funct;
    }

    public run():Promise<ValueAssertion.ResultPool> {
        const [expect, pool] = ExpectFunction.get();

        return new Promise(async (resolve, reject) => {
            try {
                await this.funct(expect);
                resolve(pool);
            }
            catch (e) {
                reject(new Test.ExecutionError(pool.length, e));
            }
        });
    }

}

namespace Test {

    export type Function = (expect:ExpectFunction)=>void|PromiseLike<void>;

    export class ExecutionError extends Error {

        public readonly assertionIndex:number;

        constructor(assertionIndex:number, reason:any) {
            if (reason instanceof Error) reason = `${reason.name}: ${reason.message}`;

            super(reason);

            this.assertionIndex = assertionIndex;
        }

    }

}

export default Test;