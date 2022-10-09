
const axios = require("axios")
axios
    .get('http://localhost:31248/Stats/Machine Learning')
    .then(res => {
        console.log(JSON.stringify(res.data))
    })
    .catch(error => {
        console.log((new Date()).toISOString(), error)
    })