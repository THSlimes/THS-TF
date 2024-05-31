import ValueAssertion from "./ValueAssertion";
import ArrayValueAssertion from "./typed-assertions/collections/ArrayValueAssertion";
import BigintValueAssertion from "./typed-assertions/primitives/BigintValueAssertion";
import DateValueAssertion from "./typed-assertions/DateValueAssertion";
import { ArgumentFunctionValueAssertion, NoArgumentFunctionValueAssertion } from "./typed-assertions/FunctionValueAssertion";
import NumberValueAssertion from "./typed-assertions/primitives/NumberValueAssertion";
import ObjectValueAssertion from "./typed-assertions/ObjectValueAssertion";
import StringValueAssertion from "./typed-assertions/primitives/StringValueAssertion";
import { isArgumentFunction, isNoArgumentFunction } from "./util-functions";
import SetValueAssertion from "./typed-assertions/collections/SetValueAssertion";

class Test {

    public readonly name:string;
    private readonly funct:Test.Function

    public constructor(name:string, funct:Test.Function) {
        this.name = name;
        this.funct = funct;
    }

    public run():Promise<ValueAssertion.ResultPool> {
        const [expect, pool] = Test.ExpectFunction.get();

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

    export type ValueAssertionFor<T> =
        T extends boolean ? ValueAssertion<boolean> :
        T extends number ? NumberValueAssertion :
        T extends bigint ? BigintValueAssertion :
        T extends string ? StringValueAssertion :
        T extends Array<infer E> ? ArrayValueAssertion<E> :
        T extends Set<infer E> ? SetValueAssertion<E> :
        T extends ()=>infer O ? NoArgumentFunctionValueAssertion<O> :
        T extends (...args:infer A)=>infer O ? { withArgs(...args:A):ArgumentFunctionValueAssertion<A,O> } :
        T extends Date ? DateValueAssertion :
        T extends object ? ObjectValueAssertion<T> :
            ValueAssertion<T>;

    export type ExpectFunction = <T>(val:T)=>ValueAssertionFor<T>;
    export namespace ExpectFunction {
    
        /** Creates an [ExpectFunction,ValueAssertion.ResultPool] pair */
        export function get():[ExpectFunction,ValueAssertion.ResultPool] {
            const pool:ValueAssertion.ResultPool = [];
            return [
                <T>(val:T) => (
                    typeof val === "number" ? new NumberValueAssertion(val, pool) :
                    typeof val === "bigint" ? new BigintValueAssertion(val, pool) :
                    typeof val === "string" ? new StringValueAssertion(val, pool) :
                    Array.isArray(val) ? new ArrayValueAssertion(val, pool) :
                    val instanceof Set ? new SetValueAssertion(val, pool) :
                    isNoArgumentFunction(val) ? new NoArgumentFunctionValueAssertion(val, pool) :
                    isArgumentFunction(val) ? { withArgs:(...args:any[]) => new ArgumentFunctionValueAssertion(val, args, pool) } :
                    val instanceof Date ? new DateValueAssertion(val, pool) :
                    typeof val === "object" && val !== null ? new ObjectValueAssertion(val, pool) :
                    new ValueAssertion(val, pool)
                ) as ValueAssertionFor<T>,
                pool
            ];
        }
    
    }
            

}

export default Test;