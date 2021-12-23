import {
    GET,
    httpRequest
} from './httpConfig'

function getProfiles() {
    return httpRequest('/users/profiles', GET);
}


export {
    getProfiles
}