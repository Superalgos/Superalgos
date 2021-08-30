/*
The Superalgos Network offers 3 types of services:

    * Social Graph Service
    * Search Index Service
    * Private Message Service
    
Users can decide which services to run at their node.

This module is the starting point of the Network Node.

*/

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

let socialGraphService = NT.modules.socialGraph.newSocialGraph()
socialGraphService.initialize()