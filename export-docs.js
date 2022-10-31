runRoot()

async function runRoot() {
  /*
  Setting up external dependencies.
  */
  global.SA = {
    projects: {
      foundations: {
        utilities: {
          filesAndDirectories: require('./Projects/Foundations/SA/Utilities/FilesAndDirectories').newFoundationsUtilitiesFilesAndDirectories(),
          icons: require('./Projects/Foundations/SA/Utilities/Icons').newFoundationsUtilitiesIcons()
        },
        globals: {
          schemas: {
            APP_SCHEMA_MAP: new Map()
          }
        }
      }
    },
    nodeModules: {
      fs: require('fs'),
      util: require('util'),
      path: require('path'),
      jsDom: require('jsdom').JSDOM
    }
  }

  global.ED = {
    DEFAULT_LANGUAGE: 'EN',
    menuLabelsMap: new Map(),
    exporter: require('./Exports/Docs/Scripts/DocumentationExporter').documentationExporter(),
    utilities: require('./Exports/Docs/Scripts/DocumentationGenerationUtilities').documentGenerationUtilities(),
    designSpace: require('./Exports/Docs/Scripts/DocumentationDesignSpace').documentationDesignSpace(),
    strings: require('./Exports/Docs/Scripts/DocumentationStringsUtilities').documentationStringsUtilities(),
    indexFile: './Exports/Docs/index.html'
  }


  /* Load Environment Variables */
  let ENVIRONMENT = require('./Environment.js')
  let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
  global.env = ENVIRONMENT_MODULE

  if(process.argv.length > 2) {
    global.env.PATH_TO_PAGES_DIR = process.argv[2]
    global.env.REMOTE_DOCS_DIR = process.argv[3] || process.argv[2]
  }

  /*
  First thing is to load the project schema file.
  */
  global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)
  global.SCHEMAS_BY_PROJECT = new Map()

  /*
  Version Management
  */
  SA.version = require('./package.json').version


  run()

  async function run() {
    ED.app = require('./Exports/Docs/ExportDocumentationApp.js').newExportDocumentationApp()
    console.log('Superalgos documentation is exporting!')
    await ED.app.run()
    console.log('Superalgos documentation has exported!')

    const robots = `User-agent: *\nDisallow: /`
    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_PAGES_DIR + '/robots.txt', robots)

  }
}