import ValueAssertion from "../ValueAssertion";
import { format } from "../util-functions";

export type TimeUnit = "ns" | "μs" | "ms" | "sec" | "min";
export namespace TimeUnit {
    export function fromNanoseconds(ns: number, toUnit: TimeUnit): number {
        switch (toUnit) {
            case "ns": return ns;
            case "μs": return ns * 0.001;
            case "ms": return ns * 0.000001;
            case "sec": return ns * 1e-9;
            case "min": return ns * 1e-9 / 60;
        }
    }
}

export default abstract class FunctionValueAssertion<A extends any[], O> extends ValueAssertion<(...args: A) => O> {

    /** Name to reference value by */
    protected abstract valName: string;

    constructor(val: (...args: A) => O, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    protected abstract callFunction(): O;

    public toReturn(expected: O): boolean {
        this.autoName = `${this.valName} = ${format.single(expected)}`;

        const res = this.callFunction();
        return this.addToResults(
            FunctionValueAssertion.deepEquals(res, expected) ?
                { status: "pass" } :
                { status: "fail", reason: format`expected ${this.valName} = ${expected}, but was actually ${res}` }
        );
    }

    private static readonly DEFAULT_NUM_TRIES: Record<TimeUnit, number> = {
        "ns": 1000,
        "μs": 1000,
        "ms": 500,
        "sec": 10,
        "min": 1
    };
    public toTakeAtMost(n: number, unit: TimeUnit = "ms", tries = FunctionValueAssertion.DEFAULT_NUM_TRIES[unit]) {
        if (n <= 0) throw new RangeError(`expected execution time must be > 0`);
        else if (tries <= 0) throw new RangeError(`number of tries must be at least 1`);
        else if (tries % 1 !== 0) throw new TypeError(`number of tries must be an integer`);

        this.autoName = `${this.valName} takes ≤ ${n}${unit}`;

        // time function
        const startTime = performance.now() * 1000000;
        for (let i = 0; i < tries; i++) this.callFunction();
        const endTime = performance.now() * 1000000;

        const avgNanoseconds = (endTime - startTime) / tries;
        const inUnit = TimeUnit.fromNanoseconds(avgNanoseconds, unit);

        return this.addToResults(
            inUnit <= n ?
                { status: "pass", note: `took ${inUnit.toPrecision(3)}${unit}` } :
                { status: "fail", reason: `${this.valName} took more than ${n}${unit} (specifically ${inUnit.toPrecision(3)}${unit})` }
        );

    }

    public toThrow<E extends Error>(ErrClass: new (...args: any[]) => E, message?: string | RegExp, cause?: any) {
        // generate automatic name based on arguments
        let autoName = `${this.valName} throws ${ErrClass.name}`;
        const options: string[] = [];
        if (typeof message === "string") options.push(format`message: ${message}`);
        else if (message instanceof RegExp) options.push(format`message ≈ ${message}`);
        if (cause !== undefined) options.push(format`cause: ${cause}`);
        if (options.length !== 0) autoName += `{${options.join(", ")}}`;

        this.autoName = autoName;

        try {
            const res = this.callFunction();
            return this.addToResults({
                status: "fail",
                reason: `${this.valName} didn't throw an error (returned ${format.single(res)} instead)`
            });
        }
        catch (err) {
            if (!(err instanceof Error)) return this.addToResults({
                status: "fail",
                reason: `${this.valName} threw ${format.single(err)} instead of an error`
            });
            else if (!(err instanceof ErrClass)) return this.addToResults({
                status: "fail",
                reason: `expected ${this.valName} to throw ${ErrClass.name}, but threw ${err.constructor.name} instead`
            });
            else if (typeof message === "string" && err.message !== message) return this.addToResults({
                status: "fail",
                reason: format`expected error message of ${message}, but was ${err.message} instead`
            });
            else if (message instanceof RegExp && !message.test(err.message)) return this.addToResults({
                status: "fail",
                reason: format`expected error message to match ${message}, but ${err.message} doesn't`
            });
            else if (cause !== undefined && !FunctionValueAssertion.deepEquals(cause, err.cause)) return this.addToResults({
                status: "fail",
                reason: `expected error cause to be ${cause}, but was actually ${err.cause}`
            });
            else return this.addToResults({ status: "pass" });
        }
    }

}

export class NoArgumentFunctionValueAssertion<O> extends FunctionValueAssertion<[], O> {

    protected override valName;

    constructor(val: () => O, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);

        this.valName = `${val.name || 'f'}()`;
    }

    protected override callFunction(): O {
        return this.val();
    }

}

export class ArgumentFunctionValueAssertion<A extends any[], O> extends FunctionValueAssertion<A, O> {

    protected override valName;
    private readonly args: A;

    constructor(val: (...args: A) => O, args: A, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);

        this.args = args;
        this.valName = `${val.name || 'f'}(${format.sequence(this.args, ',', ',')})`;
    }

    protected override callFunction(): O {
        return this.val(...this.args);
    }

}