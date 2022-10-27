runRoot()

async function runRoot() {
  global.ED = {
    generator: require('./Exports/Docs/Scripts/DocumentationExporter').documentationExporter(),
    utilities: require('./Exports/Docs/Scripts/DocumentationGenerationUtilities').documentGenerationUtilities(),
    designSpace: require('./Exports/Docs/Scripts/DocumentationDesignSpace').documentationDesignSpace()
  }

  global.SA = {
    projects: {
      foundations: {
        utilities: {
          filesAndDirectories: require('./Projects/Foundations/SA/Utilities/FilesAndDirectories').newFoundationsUtilitiesFilesAndDirectories()
        },
        globals: {
          schemas: {
            APP_SCHEMA_MAP: new Map()
          }
        }
      }
    }
  }


  /* Load Environment Variables */
  let ENVIRONMENT = require('./Environment.js')
  let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
  global.env = ENVIRONMENT_MODULE

  /*
  First thing is to load the project schema file.
  */
  global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
  global.SCHEMAS_BY_PROJECT = new Map()
  
  /*
  Setting up external dependencies.
  */
  SA.nodeModules = {
    fs: require('fs'),
    util: require('util'),
    path: require('path')
  }
  // /* 
  // Setting up the App Schema Memory Map. 
  // */
  // let APP_SCHEMAS = require('./AppSchemas.js')
  // let APP_SCHEMAS_MODULE = APP_SCHEMAS.newAppSchemas()
  // await APP_SCHEMAS_MODULE.initialize()

  /*
  Version Management
  */
  SA.version = require('./package.json').version


  run()

  async function run() {
    ED.app = require('./Exports/Docs/ExportDocumentationApp.js').newExportDocumentationApp()
    await ED.app.run()
    console.log('Superalgos documentation is exporting!')
  }
}