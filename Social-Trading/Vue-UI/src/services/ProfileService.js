import axios from 'axios';
import store from '../store/index'

const http = axios.create({
    baseURL: "http://localhost:33248",
});

const headers = new Headers({'Accept': 'application/json', 'Content-Type': 'application/json'});


    // This function retrieves the users profile data and saves it in the store.
    async function getSocialPersona() {
        return http.get('/users/social-persona', headers)
                .then(response => {
                    // If defined all is well and we save the data.
                    if (response.data.nodeCodeName !== undefined) {
                        store.commit("ADD_PROFILE", response.data);
                        return;
                    } else {
                        // The user does not have a Social Trading App Profile setup yet and needs to create one.
                        store.commit("SHOW_CREATE_PROFILE", true);
                    }
                });
    };


    // Creates a new profile or updates an existing one
    async function createProfile(profileData, personaName) {
        return http.post('/users/create-profile', profileData, headers)
                .then(response => {
                    createSocialPersona(personaName);
                    getSocialPersona();
                    return;
                }).finally(response => {
                    let message = {
                        originSocialPersonaId: store.state.profile.nodeId,
                        name: store.state.profile.userProfileHandle
                    }
                    updateProfile(message);
                    return;
                });
    }


    // Creates new repo for the social persona + create social persona
    async function createSocialPersona(profileData) {
        console.log("inside createSocial Persona ")
        return http.post('/users/social-entities', profileData, headers)
    }


    // Update profile data on github storage
    async function updateProfile(profileData) {
        return http.post('/users/profile', profileData, headers)
    }


    async function getProfiles() {
        return http.get('/users/profiles', headers);
    }

    // Loads Profile
    async function getProfile(socialPersonaId) {
        return http.get('/users/profile', headers, undefined, socialPersonaId)
    }

    async function getPaginationProfiles(initialPaginationIndex, pagination) {
        const body = {
            initialIndex: initialPaginationIndex,
            pagination: pagination
        }
        return http.post('/users/paginate-profiles', body)
    }



    async function getProfileData(profileData) {
        return http.post('/users/profileData', profileData)
    }



export {
    getProfiles,
    getProfile,
    updateProfile,
    getPaginationProfiles,
    getSocialPersona,
    createProfile,
    getProfileData,
    createSocialPersona
}