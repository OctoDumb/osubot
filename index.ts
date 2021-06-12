import "reflect-metadata";

import Bot from "./src/Bot";
import Logger, { LogLevel } from "./src/Logger";

import dotenv from "dotenv";
dotenv.config();

if(process.argv.includes('--debug')) {
    Logger.logLevel = LogLevel.DEBUG;
    Logger.log(LogLevel.DEBUG, "[DEBUG] LogLevel set to DEBUG");
}

var bot = new Bot();
bot.start();