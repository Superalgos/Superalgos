import {
    GET,
    httpRequest
} from './httpConfig'

function getProfiles() {
    return httpRequest('/profiles', GET);
}


export {
    getProfiles
}