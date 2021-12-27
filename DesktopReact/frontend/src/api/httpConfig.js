const baseURL = 'http://localhost:33248';
const headers = new Headers({'Accept': 'application/json', 'Content-Type': 'application/json'});
const   GET = 'GET',
        POST = 'POST',
        DELETE = 'DELETE',
        UPDATE = 'UPDATE',
        STATUS_OK = 'Ok';

function httpRequest(endpoint, method, body) {
    return fetch(baseURL + endpoint, {method: method, body: JSON.stringify(body), headers: headers})
        .then(response => response)
        .catch(error => error)
}

export {
    baseURL,
    GET,
    POST,
    DELETE,
    UPDATE,
    STATUS_OK,
    httpRequest
}