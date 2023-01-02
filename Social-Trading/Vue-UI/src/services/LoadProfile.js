import { getSocialPersona, getProfile, getProfiles } from "../api/profile.httpService.js"
import store from "../store"

// Note: current function only loads basic meta data for the profile will need to acces additional functions from the api to finish fully loading
async function loadProfile() {
        return getSocialPersona().then(data => {
            return data.json()

        }).then( socialPersona => {
            store.commit({
                type: 'ADD_PROFILE',
                profile: socialPersona
            })
            return socialPersona
        }).then( socialPersona => {
            //socialPersona.userProfileId
            getProfile({socialPersonaId: socialPersona.nodeId}).then(data => {
                return data.json()
            }).then(profile => {
                console.log('this is our loaded profile', profile)
            })
        })
}

export {
    loadProfile
}