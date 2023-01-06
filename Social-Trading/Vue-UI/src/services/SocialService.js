import axios from 'axios';
import store from '../store/index'

const http = axios.create({
    baseURL: "http://localhost:33248",
});

const headers = new Headers({'Accept': 'application/json', 'Content-Type': 'application/json'});


    async function followUser(userProfileId, eventType) {
        return http.post('/users/follow', headers, {userProfileId: userProfileId, eventType: eventType})
    }

export {
    followUser
}