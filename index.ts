import "reflect-metadata";

import Bot from "./src/Bot";
import Logger, { LogLevel } from "./src/Logger";

import dotenv from "dotenv";
dotenv.config();

Logger.init();

if(process.argv.includes('--debug')) {
    Logger.logLevel = LogLevel.DEBUG;
    Logger.debug("LogLevel set to DEBUG");
}

var bot = new Bot();
bot.start();