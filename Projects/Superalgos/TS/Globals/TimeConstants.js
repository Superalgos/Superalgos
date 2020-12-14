exports.newSuperalgosGlobalsTimeConstants = function () {
    /* Callbacks default responses. */
    let thisObject = {
        ONE_YEAR_IN_MILISECONDS: 365 * 24 * 60 * 60 * 1000,
        ONE_DAY_IN_MILISECONDS: 24 * 60 * 60 * 1000,
        ONE_MIN_IN_MILISECONDS: 60 * 1000,    
        GMT_SECONDS: ':00.000 GMT+0000'
    }

    return thisObject
}