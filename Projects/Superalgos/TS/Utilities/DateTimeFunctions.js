exports.newSuperalgosUtilitiesDateTimeFunctions = function () {

    let thisObject = {
        removeTime: removeTime,
        getPercentage: getPercentage,
        areTheseDatesEqual: areTheseDatesEqual
    }

    return thisObject

    function  removeTime (datetime) {
        const GMT_SECONDS = ':00.000 GMT+0000';
        let date = new Date(datetime)
        return new Date(date.getUTCFullYear() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCDate() + " " + "00:00" + GMT_SECONDS);
    }

    function getPercentage(fromDate, currentDate, lastDate) {
        let fromDays = Math.trunc(fromDate.valueOf() / TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
        let currentDays = Math.trunc(currentDate.valueOf() / TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
        let lastDays = Math.trunc(lastDate.valueOf() / TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
        let percentage = (currentDays - fromDays) * 100 / (lastDays - fromDays)
        if ((lastDays - fromDays) === 0) {
            percentage = 100
        }
        return percentage
    }

    function areTheseDatesEqual(date1, date2) {
        let day1Days = Math.trunc(date1.valueOf() / TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)
        let day2Days = Math.trunc(date2.valueOf() / TS.projects.superalgos.globals.timeConstants.ONE_DAY_IN_MILISECONDS)

        if (day1Days === day2Days) {
            return true
        } else {
            return false
        }
    }
}