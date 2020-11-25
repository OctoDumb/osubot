import chalk from "chalk";

export enum LogLevel {
    ERROR,
    WARNING,
    MESSAGE,
    DEBUG
}

export const styles = {
    [LogLevel.ERROR]: chalk.bold.red,
    [LogLevel.WARNING]: chalk.yellow,
    [LogLevel.MESSAGE]: chalk.cyan,
    [LogLevel.DEBUG]: chalk.bold.magenta
}

export default class Logger {
    public static logLevel = LogLevel.MESSAGE;

    public static log(level: LogLevel, message: string): void {
        if(level <= Logger.logLevel)
            console.log(styles[level](message));
    }

    public static assert(condition: boolean, level: LogLevel, message: string): void {
        if(condition)
            Logger.log(level, message);
    }
}