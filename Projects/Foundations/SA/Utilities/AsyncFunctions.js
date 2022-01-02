exports.newFoundationsUtilitiesAsyncFunctions = function () {

    let thisObject = {
        sleep: sleep
    }

    return thisObject

    async function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms)
        })
    }
}