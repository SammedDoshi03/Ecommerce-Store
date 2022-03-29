/**
 * @info - custom logging solution
 * @info - generating node event for each log
 */
import { inspect } from "util";
import { DEBUG, ERROR, EVENT, INFO, SUCCESS, WARN } from "../utils/constant";
import { blue, gray, green, red, yellow } from "chalk";
import Time from "../utils/Time";

// used for logging given data
export default class Log {
    /**
     * log event type
     * @param type
     * @private
     */
    private static logEventType(type) {
        switch (type) {
            case INFO:
                return EVENT.log.info;
            case WARN:
                return EVENT.log.warn;
            case DEBUG:
                return EVENT.log.debug;
            case ERROR:
                return EVENT.log.error;
            default:
                return EVENT.log.success;
        }
    }

    /**
     * send the log event
     * @param message
     * @param type
     * @param suppress
     * @private
     */
    private static logEvent(message, type, suppress = false) {
        //
    }

    /**
     * log message on console
     * @param message
     * @param type
     * @private
     */
    private static logConsole(message, type) {
        typeof message === "string"
            ? console.log(`${Time.current()} | ${type} | ${message}`)
            : console.log(`${Time.current()} | ${type} | ${inspect(message, false, 10, true)}`);
    }

    /**
     * log to console irrespective of options
     * will log as info only
     */
    public static all(message) {
        this.logConsole(message, gray(INFO));
    }

    /**
     * info log
     * @param message
     * @param silent
     * @param suppress - if no need to emit event
     * @public
     */
    public static info(message, silent = false, suppress = false) {
        this.logConsole(message, gray(INFO));
    }

    /**
     * debug log
     * @param message
     * @param silent
     * @param suppress - if no need to emit event
     * @public
     */
    public static debug(message, silent = false, suppress = false) {
        this.logConsole(message, blue(DEBUG));
    }

    /**
     * warn log
     * @param message
     * @param silent
     * @param suppress - if no need to emit event
     * @public
     */
    public static warn(message, silent = false, suppress = false) {
        this.logConsole(message, yellow(WARN));
    }

    /**
     * error log
     * @param message
     * @param silent
     * @param suppress - if no need to emit event
     * @public
     */
    public static error(message, silent = false, suppress = false) {
        this.logConsole(message, red(ERROR));
    }

    /**
     * success log
     * @param message
     * @param silent
     * @param suppress - if no need to emit event
     * @public
     */
    public static success(message, silent = false, suppress = false) {
        this.logConsole(message, green(SUCCESS));
    }
}
