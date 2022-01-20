exports.newSocialTradingFunctionLibrariesUserProfile = function () {

    let thisObject = {
        createUserProfile: createUserProfile
    }

    return thisObject


    async function createUserProfile() {
        /*
        These are the properties at the message that we expect here:

        storageProviderName             Must be "Github" for now, because it is the only storage provider we are currently working with.        
        storageProviderUsername         Must be the Github username, not email or anything else.
        storageProviderToken            Must be a valid Github Token.
        userAppType                     Possible values for this field are: "Social Trading Desktop App", "Social Trading Mobile App"
              
        At this function we are going to:

        1. We will check if the storageProviderName has a fork of Superalgos already created. If not, we will create the fork.
        2. We will check at the fork for the User Profile and read that file if exists. 
        3. If the user profile file does not exist, then we are going to create it. 
        4. Add to the User Profile the User App based on userAppType.
        5. Create a Storage Container for "My-Social-Trading-Data".
        6. Create the Signing Accounts.

        */
    }
}