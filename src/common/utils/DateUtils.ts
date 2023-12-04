
import moment from 'moment';

    /**
     * A class that provides methods that performs utility operations on dates and time using moments.js
    */
class DateUtils {

    /**
     * Returns the month part of a date object
     * @param date A javascript date object
     * @returns a number from 1 and 12
    */
    public getMonth(date: Date): number {
        return date.getMonth()+1;
    }

    /**
     * Returns the name of the  month part of a date object
     * @param date A javascript date object
     * @returns a month from January and December
    */
    public getMonthName(date: Date): string {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        const month = date.getMonth();
        return monthNames[month];
    }

    /**
     * Returns the minutes part of a date object
     * @param date A javascript date object
     * @returns a number from 1 and 60
    */
    public getMinutes(date: Date): number {
        return date.getMinutes()+1;
    }

    /**
     * Returns the seconds part of a date object
     * @param date A javascript date object
     * @returns a number from 1 and 60
    */
    public getSeconds(date: Date): number {
        return date.getSeconds()+1;
    }

    /**
     * Returns the name of the  day part of a date object
     * @param date A javascript date object
     * @returns a day from Sunday and Saturday
    */
    public getDay(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }

    /**
     * Converts a numeric day value to it's equivalent name
     * @param day  number ranging from 1 to 7
     * @returns a day from Sunday and Saturday
    */
    public getDayByNumber(day: number): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[day - 1];
    }


    /**
     * Returns the number of weeks in a date object
     * @param date A javascript date object
     * @returns number of weeks as a string
    */
    public getWeek(date: Date): string {
        return moment(date).format('w');
    }

    /**
     * Adds the specified duration/unit of time to a date object
     * @param date A javascript date object
     * @param unit a string specifying the unit of time to be added - unit options are [seconds, minutes, hours, days, months]
     * @param amount a number specifying the quantity of the specified unit to be added
     * @returns a javascript date object
    */
    public addToDate(date: Date, unit: string, amount: number) {
        //@ts-ignore
        return moment(date).add(amount, unit).toDate();
    }

    /**
     * Subtracts the specified duration/unit of time from a date object
     * @param date A javascript date object
     * @param unit a string specifying the unit of time to be subtracted - unit options are [seconds, minutes, hours, days, months]
     * @param amount a number specifying the quantity of the specified unit to be subtracted
     * @returns a javascript date object
    */
    public subtractFromDate(date: Date, unit: string, amount: number) {
        //@ts-ignore
        return moment(date).subtract(amount, unit).toDate();
    }

    /**
     * Formats the a date using the provided format
     * @param date A javascript date object
     * @param format the expected date format. eg. YYYY-MM-DD
     * @returns a string in the specified format
    */
    public formatDate(date: Date, format: string) {
        return moment(date, format).toString();
    }

    /**
     * Get the time difference between two dates
     * @param startDate A javascript date object. The date to start from.
     * @param endDate A javascript date object. The date to end at.
     * @param unit a string specifying the unit of time in which to express the difference - unit options are [seconds, minutes, hours, days, months]
     * @returns a number
    */
    public getDateDifference(startDate: Date, endDate: Date, unit: string) {
        //@ts-ignore
        return moment(endDate).diff(moment(startDate), unit)
    }

    /**
     * Gets a date that it's equivalent to the beginning of the provided date object
     * @param date A javascript date object.
     * @returns a javascript date object
    */
    public startOfDay(date: Date) {
        return moment(date).startOf("day").toDate();
    }

    /**
     * Gets a date that it's equivalent to the ending of the provided date object
     * @param date A javascript date object.
     * @returns a javascript date object
    */
    public endOfDay(date: Date) {
        return moment(date).endOf("day").toDate();
    }

    /**
     * Adds timestamp properties to the provided object
     * - timestamp components are [day_created, week_created, month_created, year_created, week_day_created, hour_created, am_or_pm]
     * @param data An object on which the timestamp components are to be set.
     * @returns the provided modified data object
    */
    public registerTimestamp(data: Record<string,any>) {
        const currentDate = new Date();
        data.day_created = currentDate.getDate();
        data.week_created = this.getWeek(currentDate);
        data.month_created = this.getMonth(currentDate);
        data.year_created = currentDate.getFullYear();
        data.week_day_created = this.getDay(currentDate);
        data.hour_created = currentDate.getHours();
        data.am_or_pm = moment().format('A');

        return data;
    }
}

export default DateUtils;