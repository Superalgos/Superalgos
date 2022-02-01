exports.newSocialTradingGlobalsProfileTypes = function () {

    let thisObject = {
        /* Actions over Social Entities Profiles */
        CREATE_USER_PROFILE: 10,                // Used at the Sign Up process when to create a new Superalgos User Profile or to use an existing one.
        GET_USER_PROFILE_INFO: 11,              // User to fetch the very basic info of the User Profile attached to the app.
        CREATE_SOCIAL_ENTITY: 12,               // This is to create a Social Entity and also it's Storage. 
        DELETE_SOCIAL_ENTITY: 13,               // This is to delete a Social Entity from the User Profile.
        LIST_SOCIAL_ENTITIES: 14,               // This is to retrieve a list of Social Personas or Social Trading Bots belonging to the User Profile created at Sign Up.
        SAVE_SOCIAL_ENTITY: 15,                 // Save a Social Entity's information (bio, profile pic, banner and others) using Open Storage.      
        LOAD_SOCIAL_ENTITY: 16                  // Load a SOcial Entity's information from Open Storage.
    }

    return thisObject
}