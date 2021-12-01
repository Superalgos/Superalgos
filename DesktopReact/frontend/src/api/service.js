const baseURL = 'http://localhost:33249'
const GET = 'GET'
const POST = 'POST'
const DELETE = 'DELETE'
const UPDATE = 'UPDATE'

function getProfiles(){
    return call('/profiles', GET);
}

function getClientNode(){
    return call('/ClientNode', GET);
}

function call(endpoint, method, body){
    return new Promise(async(resolve, reject) => {
        fetch(baseURL + endpoint, { method:method, body:body })
            .then(response => resolve(response))
            .catch(error => reject(error))
    })
    
}

export {
    getProfiles,
    getClientNode
}

