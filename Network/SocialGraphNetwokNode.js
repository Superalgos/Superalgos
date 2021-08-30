/*
The Superalgos Network have 3 types of nodes:

    * Social Graph Nodes
    * Search Index Nodes
    * Private Message Nodes
    
This module is the starting point of the Social Graph Network Node.

This type of node is responsible for mantaining the whole Social Graph
or relationships between User and Bot profiles and also between their posts.
*/
global.NT = {
    modules: {
        BOOTSTRAP: require('./Bootstrap.js'),
        USER_PROFILE: require('./UserProfile.js'),
        BOT_PROFILE: require('./BotProfile.js'),
        POST: require('./Post.js'),
        QUERY: require('./Query.js'),
        QUERY_USER_PROFILE_STATS: require('./Queries/UserProfileStats.js'),
        QUERY_BOT_PROFILE_STATS: require('./Queries/BotProfileStats.js'),
        QUERY_PROFILE_POSTS: require('./Queries/ProfilePosts.js'),
        QUERY_PROFILE_FOLLOWERS: require('./Queries/ProfileFollowers.js'),
        QUERY_PROFILE_FOLLOWING: require('./Queries/ProfileFollowing.js'),
        QUERY_POST_REPLIES: require('./Queries/PostReplies.js'),
        QUERY_EVENTS: require('./Queries/Events.js')
    },
    utilities: {
        queriesValidations: require('./Utilities/QueriesValidations.js').newQueriesValidations()
    }
}
/* 
The NT object is accesible everywhere at the Superalgos Network. 
It provides access to all modules built for this Network.
*/
global.NT = {}
/* 
The SA object is accesible everywhere at the Superalgos Network. 
It provides access to all modules built for Superalgos in general.
*/
global.SA = {}
/*
First thing is to load the project schema file.
*/
global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
/* 
Setting up the modules that will be available for the Servers Running inside this Client 
*/
let MULTI_PROJECT = require('../MultiProject.js');
let MULTI_PROJECT_MODULE = MULTI_PROJECT.newMultiProject()
MULTI_PROJECT_MODULE.initialize(CL, 'CL')
MULTI_PROJECT_MODULE.initialize(SA, 'SA')

let bootstrapProcess = NT.modules.BOOTSTRAP.newBootstrap()
bootstrapProcess.initialize()