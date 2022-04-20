exports.newAppSchemas = function () {
  let thisObject = {
    initialize: initialize
  }

  return thisObject

  async function initialize () {
    /*
    Here we will load into memory all the APP_SCHEMA files of every project.
    */

    await loadAppSchemas()

    async function loadAppSchemas () {
      return new Promise(loadAppSchemasForAllProjects)

      function loadAppSchemasForAllProjects (resolve) {
        let projectsLoaded = 0
        for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
          let projectDefinition = PROJECTS_SCHEMA[i]
          loadAppSchemasForProject(projectDefinition.name)
        }

        function loadAppSchemasForProject (project) {
          let filePath = global.env.PATH_TO_PROJECTS + '/' + project + '/Schemas/'
          let folder = 'App-Schema'

          SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(filePath + folder, onFilesReady)

          function onFilesReady (files) {
            for (let k = 0; k < files.length; k++) {
              let name = files[k]
              let nameSplitted = name.split(folder)
              let fileName = nameSplitted[1]
              for (let i = 0; i < 10; i++) {
                fileName = fileName.replace('\\', '/')
              }
              let fileToRead = filePath + folder + fileName

              let fileContent = SA.nodeModules.fs.readFileSync(fileToRead)
              let schemaDocument
              try {
                schemaDocument = JSON.parse(fileContent)
                SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.set(project + '-' + schemaDocument.type, schemaDocument)
              } catch (err) {
                console.log('[WARN] loadAppSchemasForProject -> Error Parsing JSON File: ' + fileToRead + '. Error = ' + err.stack)
                return
              }
            }
            projectsLoaded++

            if (projectsLoaded === PROJECTS_SCHEMA.length) {
              resolve()
            }
          }
        }
      }
    }
  }
}
