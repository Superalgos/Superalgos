const baseURL = 'http://localhost:33248';
const headers = new Headers({'Accept': 'application/json', 'Content-Type': 'application/json'});
const GET = 'GET', POST = 'POST', DELETE = 'DELETE', UPDATE = 'UPDATE', STATUS_OK = 'Ok';

function httpRequest(endpoint, method, body, queryParams) {
    const url = new URL(baseURL + endpoint);
    if (queryParams) Object.keys(queryParams).forEach(key => url.searchParams.append(key, queryParams[key]));
    return fetch(url.toString(), {method: method, body: JSON.stringify(body), headers: headers})
        .then(response => response)
        .catch(error => error);
}

export {
    baseURL, GET, POST, DELETE, UPDATE, STATUS_OK, httpRequest
}