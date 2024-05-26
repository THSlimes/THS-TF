import { dateIsValid, format, getMonthName } from "../util-functions";
import ValueAssertion from "../ValueAssertion";

export default class DateValueAssertion extends ValueAssertion<Date> {

    constructor(val: Date, resultsPool: ValueAssertion.ResultPool) {
        super(val, resultsPool);
    }

    public toBeBefore(upperBound:Date) {
        if (!dateIsValid(upperBound)) throw new Error("given date is invalid");

        this.autoName = format`given Date is before ${upperBound}`;

        return this.addToResults(
            this.val < upperBound ?
                { status: "pass" } :
                { status: "fail", reason: format`given Date (${this.val}) is after ${upperBound}` }
        );
    }

    public toBeAfter(lowerBound:Date) {
        if (!dateIsValid(lowerBound)) throw new Error("given date is invalid");

        this.autoName = format`given Date is after ${lowerBound}`;

        return this.addToResults(
            this.val > lowerBound ?
                { status: "pass" } :
                { status: "fail", reason: format`given Date (${this.val}) is before ${lowerBound}` }
        );
    }

    public toBeValid() {
        this.autoName = "given Date is valid";

        return this.addToResults(
            dateIsValid(this.val) ?
                { status: "pass" } :
                { status: "fail", reason: "given Date is invalid" }
        );
    }

    public toBeInvalid() {
        this.autoName = "given Date is invalid";

        return this.addToResults(
            dateIsValid(this.val) ?
                { status: "fail", reason: "given Date is valid" } :
                { status: "pass" }
        );
    }


    public toBeOn(year?:number, month?:number, date?:number) {
        // determine automatic name based on what is specified
        let dateDesc:string;
        if (year !== undefined) {
            if (month !== undefined) dateDesc = date !== undefined ?
                `on ${getMonthName(month)} ${format.nth(date)} ${year}` : // YMD
                `in ${getMonthName(month)} ${year}`; // YM
            else dateDesc = date !== undefined ?
                `on a ${format.nth(date)} in ${year}` : // YD
                `in ${year}`; // Y
        }
        else if (month !== undefined) dateDesc = date !== undefined ?
            `on a ${format.nth(date)} of ${getMonthName(month)}` : // MD
            `in ${getMonthName(month)}`;
        else if (date !== undefined) dateDesc = `on a ${format.nth(date)}`;
        else throw new Error("at least one of year, month or date must be specified");

        this.autoName = `Date falls ${dateDesc}`;

        if (year !== undefined && this.val.getFullYear() !== year) return this.addToResults({
            status: "fail",
            reason: format`Date falls in ${this.val.getFullYear()}, not ${year}`
        });
        else if (month !== undefined && this.val.getMonth() + 1 !== month) return this.addToResults({
            status: "fail",
            reason: `Date falls in ${getMonthName(this.val)}, not ${getMonthName(month)}`
        });
        else if (date !== undefined && this.val.getDate() !== date) return this.addToResults({
            status: 'fail',
            reason: `Date falls on the ${format.nth(date)} of the month, but ${format.single(this.val)} doesn't`
        });
        else return this.addToResults({ status: "pass" });
    }

    public toBeAt(hours?:number, minutes?:number, seconds?:number, milliseconds?:number) {
        if ([hours, minutes, seconds, milliseconds].every(t => t === undefined)) throw new Error("at least one of hours, minutes, seconds or milliseconds must be specified");

        // determine automatic name based on what is specified
        const parts = [
            hours?.toString().padStart(2, '0') ?? "XX",
            minutes?.toString().padStart(2, '0') ?? "XX",
            seconds?.toString().padStart(2, '0') ?? "XX",
            milliseconds?.toString().padStart(3, '0') ?? "XXX"
        ];
        let timeDesc = `Date is at ${parts[0]}:${parts[1]}`;

        if (seconds !== undefined || milliseconds !== undefined) {
            timeDesc += `:${parts[2]}`;
            if (milliseconds !== undefined) timeDesc += `.${parts[3]}`;
        }

        this.autoName = timeDesc;

        if (hours !== undefined && this.val.getHours() !== hours) return this.addToResults({
            status: "fail",
            reason: format`Date is at hour ${this.val.getHours()}, not at hour ${hours}`
        });
        if (minutes !== undefined && this.val.getMinutes() !== minutes) return this.addToResults({
            status: "fail",
            reason: format`Date is at minute ${this.val.getMinutes()}, not at minute ${minutes}`
        });
        if (seconds !== undefined && this.val.getSeconds() !== seconds) return this.addToResults({
            status: "fail",
            reason: format`Date is at second ${this.val.getSeconds()}, not at second ${seconds}`
        });
        if (milliseconds !== undefined && this.val.getMilliseconds() !== milliseconds) return this.addToResults({
            status: "fail",
            reason: format`Date is at millisecond ${this.val.getMilliseconds()}, not at millisecond ${milliseconds}`
        });
        else return this.addToResults({ status: "pass" });

    }

}