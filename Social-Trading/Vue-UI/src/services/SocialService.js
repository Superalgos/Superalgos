import axios from 'axios';
import store from '../store/index'

const http = axios.create({
    baseURL: "http://localhost:33248",
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

    //TODO Not Setup Yet
    async function followUser(socialPersonaId, eventType) {
        return http.post('/social/follow', {socialPersonaId: socialPersonaId, eventType: eventType})
    }

    // Returns all users with social personas and saved there profile data in the store as an array of users.
    async function getAllUsers(socialPersonaId) {
        let userArray = []
        return http.get('/social/all-users', {params: socialPersonaId}).then(response => {
            let responseData = response.data.data
            let data = JSON.parse(responseData)
            let responseArray = data.data
            // We look through the response array and gather each user profile into an array to store in the vuex store.
            for (let i = 0; i < responseArray.length; i++) {
                let thisProfileData = responseArray[i].profileData
                console.log(thisProfileData)
                userArray.push(thisProfileData)

                // We check to see if it is our own profile and if so update it in the store.
                if(thisProfileData.originSocialPersonaId === store.state.profile.nodeId) {
                    store.commit("UPDATE_NAME", thisProfileData.name);
                    store.commit("UPDATE_BIO", thisProfileData.bio);
                    store.commit("ADD_PROFILE_IMAGE", thisProfileData.profilePic)
                }
            }
            // Here we send the userArray to the store for later use.
            store.commit("SET_USER_ARRAY", userArray);

            return responseData
        });
    }

export {
    getAllUsers,
    followUser
}