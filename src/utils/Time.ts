/**
 * @info
 */
import moment from "moment";

export default class Time {
    private static format = "YYYY-MM-DD[T]HH:mm:ssZ";

    static current() {
        return moment().format(this.format);
    }
}
