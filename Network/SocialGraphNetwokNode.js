/*
The Superalgos Network have 3 types of nodes:

    * Social Graph Nodes
    * Search Index Nodes
    * Private Message Nodes
    
This module is the starting point of the Social Graph Network Node.

This type of node is responsible for mantaining the whole Social Graph
or relationships between User and Bot profiles and also between their posts.
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

let bootstrapProcess = NT.modules.BOOTSTRAP.newBootstrap()
bootstrapProcess.initialize()