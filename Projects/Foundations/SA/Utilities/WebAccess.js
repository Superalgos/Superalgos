exports.newFoundationsUtilitiesWebAccess = function () {

    let thisObject = {
        fetchAPIDataFile: fetchAPIDataFile
    }

    return thisObject

    async function fetchAPIDataFile(url) {
        let promise = new Promise((resolve, reject) => {

            const fetch = SA.nodeModules.nodeFetch
            /*
            This is how we call the API.
            */
            fetch(url)
                .then((response) => {

                    if (response.status !== 200) {
                        console.log('[ERROR] fetchAPIData -> then -> url =' + url)
                        let err = {
                            message: 'Fetch of ' + url + ' failed with status ' + response.status
                        }
                        reject(err)
                        return
                    }
                    getResponseBody()

                    function getResponseBody() {
                        response.text().then(body => {
                            resolve(body)
                        })
                    }
                })
                .catch(err => {
                    console.log('[ERROR] fetchAPIData -> url =' + url)
                    reject(err)
                })
        }
        )
        return promise
    }
}