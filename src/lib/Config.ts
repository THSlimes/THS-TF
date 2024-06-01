import colors from "colors";
import Test from "./Test";
colors.enable();

/** A Printer represents something which may output information in some way (e.g. by logging it to the console). */
interface Printer {
    log(message?: any, ...optionalParams: any[]): void;
    warn(message?: any, ...optionalParams: any[]): void;
    error(message?: any, ...optionalParams: any[]): void;
};

type HasResultLoggers = {[s in Test.Result]: (message?: any, ...optionalParams: any[]) => void};
abstract class OutputLogger implements HasResultLoggers {

    protected readonly printer:Printer;
    protected readonly settings:Config.OutputSettings;

    public constructor(printer:Printer, settings:Config.OutputSettings) {
        this.printer = printer;
        this.settings = settings;
        Object.freeze(settings);
    }

    public abstract pass(message?: any, ...optionalParams: any[]): void;

    public abstract fail(message?: any, ...optionalParams: any[]): void;

    public abstract error(message?: any, ...optionalParams: any[]): void;

    public abstract warning(message?: any, ...optionalParams: any[]): void;

    public log(type:Test.Result, ...messages:any[]):void {
        return this[type](...messages);
    }

}

/**
 * A StyledLogger is a wrapper around another logger.
 * It applies styling to the data before outputting it
 */
export class StyledOutputLogger extends OutputLogger {

    private splitWhitespace(str:string):[string, string] {
        let i = 0;
        while (i < str.length - 1 && str.substring(0, i + 1).trim().length === 0) i ++;        

        return [str.substring(0, i), str.substring(i)];
    }

    pass(message?: any, ...optionalParams: any[]): void {
        const [whitespace, str] = this.splitWhitespace([message, ...optionalParams].map(String).join(' '));
        return this.printer.log(whitespace + str.green);
    }

    fail(message?: any, ...optionalParams: any[]): void {
        const [whitespace, str] = this.splitWhitespace([message, ...optionalParams].map(String).join(' '));
        return this.printer.error(whitespace + str.red);
    }

    error(message?: any, ...optionalParams: any[]): void {
        const [whitespace, str] = this.splitWhitespace([message, ...optionalParams].map(String).join(' '));
        return this.printer.error(whitespace + str.bgRed.underline.white);
    }

    warning(message?: any, ...optionalParams: any[]): void {
        const [whitespace, str] = this.splitWhitespace([message, ...optionalParams].map(String).join(' '));
        return this.printer.warn(whitespace + str.italic.yellow);
    }

}

namespace Config {
    export interface OutputSettings {
        printer: Printer
        strict: boolean,
        verbose: boolean
    }
    
    export interface Settings {
        testDir: string,
        outputSettings: OutputSettings
        logger: OutputLogger,
    }
}

export default Config;