import chalk from "chalk";
import dateFormat from "dateformat";
import { createWriteStream, existsSync, mkdirSync, writeFileSync, WriteStream } from "fs";
import path from "path";
import cron from "node-cron";

export enum LogLevel {
    FATAL,
    ERROR,
    WARN,
    INFO,
    DEBUG,
    TRACE
}

export const styles = {
    [LogLevel.FATAL]: chalk.bold.red,
    [LogLevel.ERROR]: chalk.red,
    [LogLevel.WARN]: chalk.yellow,
    [LogLevel.INFO]: chalk.cyan,
    [LogLevel.DEBUG]: chalk.bold.bgGray,
    [LogLevel.TRACE]: chalk.gray
}

export default class Logger {
    public static logLevel = LogLevel.INFO;
    public static fileLogLevel = LogLevel.DEBUG;

    private static logPath: string = path.join(process.cwd(), "logs");

    private static _stream: WriteStream;

    private static _isInitialized: boolean = false;

    public static init() {
        if(Logger._isInitialized)
            throw "";

        Logger.initStream();

        cron.schedule("0 0 * * *", () => {
            Logger.initStream();
        });

        Logger._isInitialized = true;
    }

    public static stopLogger() {
        Logger._stream?.close();
        Logger._stream = null;
    }

    private static initStream() {
        if(!existsSync(Logger.logPath))
            mkdirSync(Logger.logPath);

        if(Logger._stream)
            Logger.stopLogger();
        
        let filename = path.join(Logger.logPath, dateFormat("yyyy-mm-dd") + ".log");

        let existed = existsSync(filename);

        Logger._stream = createWriteStream(filename, { flags: "a+" });

        if(!existed)
            Logger.addHeader();
    }

    private static addHeader() {
        if(!Logger._stream)
            Logger.initStream();

        let line = '->'.repeat(12) + '-' + '<-'.repeat(12) + '\n'

        Logger._stream.write(line);
        Logger._stream.write('https://github.com/OctoDumb/osubot\n');
        Logger._stream.write(`Log level: ${LogLevel[Logger.fileLogLevel]}\n`);
        Logger._stream.write(line);
    }

    private static _logToConsole(level: LogLevel, message: string[], target: string, time: string) {
        if(level > Logger.logLevel) return;
        for(let line of message)
            console.log(styles[level](`${time} [${LogLevel[level]}${target}] ${line}`));
    }

    private static _logToFile(level: LogLevel, message: string[], target: string, time: string) {
        if(level > Logger.fileLogLevel) return;
        for(let line of message)
            Logger._stream?.write(`${time} [${LogLevel[level]}${target}] ${line}\n`);
    }

    private static log(level: LogLevel, message: string | string[], target: string = ""): void {
        var time = dateFormat("yyyy-mm-dd HH:MM:ss");

        if(typeof message == "string") message = [ message ];

        if(target)
            target = "/" + target

        Logger._logToConsole(level, message, target, time);
        Logger._logToFile(level, message, target, time);
    }

    private static errorToString(error: Error): string[] {
        return error.stack?.split("\n") ?? [`${error.name}: ${error.message}`]
    }

    public static fatal(message: string | string[], target?: string) {
        Logger.log(LogLevel.FATAL, message, target);
        process.exit();
    }


    public static error(error: string | (string | Error)[] | Error, target?: string) {
        let message: string | string[] = []
        if(!Array.isArray(error)) {
            message = error instanceof Error ? Logger.errorToString(error) : [ error ];
        } else {
            for(let e of error) {
                if(e instanceof Error)
                    message.push(...Logger.errorToString(e))
                else
                    message.push(e)
            }
        }
        Logger.log(LogLevel.ERROR, message, target)
    }

    public static warn(message: string | string[], target?: string) {
        Logger.log(LogLevel.WARN, message, target);
    }

    public static info(message: string | string[], target?: string) {
        Logger.log(LogLevel.INFO, message, target);
    }

    public static debug(message: string | string[], target?: string) {
        Logger.log(LogLevel.DEBUG, message, target);
    }

    public static trace(message: string | string[], target?: string) {
        Logger.log(LogLevel.TRACE, message, target);
    }
}