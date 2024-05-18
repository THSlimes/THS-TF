abstract class ValueAssertion<T extends ValueAssertion.Assertable> {

    protected readonly val:T;
    private readonly resultsPool:ValueAssertion.Result[];
    protected addToResults(res:ValueAssertion.Result) {
        this.resultsPool.push(res);
    }

    public constructor(val:T, resultsPool:ValueAssertion.Result[]) {
        this.val = val;
        this.resultsPool = resultsPool;
    }

    protected abstract checkEq(expected:T):boolean;

    public toBe(expected:T):void {
        this.addToResults(this.checkEq(expected) ? {
            status: "pass"
        } : {
            status: "fail",
            reason: `expected value to be ${expected?.toString()}, but was actually ${this.val?.toString()}`
        });
    }

    public toNotBe(notExpected:T) {
        this.addToResults(!this.checkEq(notExpected) ? {
            status: "pass"
        } : {
            status: "fail",
            reason: `expected value not to be ${notExpected?.toString()}, but it was`
        });
    }

}

type Primitive = string|number|bigint|boolean|undefined|symbol|null;
class PrimitiveValueAssertion<P extends Primitive> extends ValueAssertion<P> {

    public constructor(val:P, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    protected override checkEq(expected:P):boolean {
        return this.val === expected;
    }
    
}

class ObjectValueAssertion<O extends object> extends ValueAssertion<O> {

    public constructor(val:O, resultsPool:ValueAssertion.Result[]) {
        super(val, resultsPool);
    }

    protected override checkEq(expected:O):boolean {
        // TODO: implement
        return false;
    }

}

export namespace ValueAssertion {

    export type Assertable = Primitive | object;

    export type Result = {
        status:"pass",
    } | {
        status:"fail",
        reason:string
    };

    export type For<T extends Assertable> = T extends Primitive ?
        PrimitiveValueAssertion<T> :
        T extends object ?
            ObjectValueAssertion<T> :
            never;

}

export type ExpectFunction = <T extends ValueAssertion.Assertable>(val:T)=>ValueAssertion.For<T>;
export namespace ExpectFunction {
    export function get():[ExpectFunction,ValueAssertion.Result[]] {
        const pool:ValueAssertion.Result[] = [];
        return [<T extends ValueAssertion.Assertable>(val:T) => {
            if (typeof val === "bigint") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "boolean") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "number") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "string") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "symbol") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "undefined") return new PrimitiveValueAssertion(val, pool) as ValueAssertion.For<T>;
            else if (val == null) return new PrimitiveValueAssertion<null>(val, pool) as ValueAssertion.For<T>;
            else if (typeof val === "object") return new ObjectValueAssertion(val, pool) as ValueAssertion.For<T>;
            else throw new Error(`no value assertion type found for ${String(val)}`);
        }, pool];
    }
}
