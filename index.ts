import Bot from "./src/Bot";
import Logger, { LogLevel } from "./src/Logger";

if(process.argv.includes('--debug')) {
    Logger.logLevel = LogLevel.DEBUG;
    Logger.log(LogLevel.DEBUG, "[DEBUG] LogLevel set to DEBUG");
}

var bot = new Bot();
bot.start();