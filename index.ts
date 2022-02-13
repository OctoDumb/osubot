import "reflect-metadata";

import { install as setupSourceMap } from "source-map-support";

import Bot from "./src/Bot";
import Logger, { LogLevel } from "./src/Logger";

import dotenv from "dotenv";
dotenv.config();

setupSourceMap();

Logger.init();

if(process.argv.includes('--debug')) {
    Logger.logLevel = LogLevel.DEBUG;
    Logger.debug("LogLevel set to DEBUG");
}

var bot = new Bot();
bot.start();