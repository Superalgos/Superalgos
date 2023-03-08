exports.newFoundationsUtilitiesIcons = function () {
    let thisObject = {
        retrieveIcons: retrieveIcons
    }

    return thisObject

    /**
     * Retrieves all the icons for each project and returns them in the callback as an array of tuples:
     * 
     * `[[project:string, file:string]]`
     * 
     * @param {function([[string]]):void} callback 
     */
    function retrieveIcons(callback) {
        let projects = SA.projects.foundations.utilities.filesAndDirectories.getDirectories(global.env.PATH_TO_PROJECTS)
        let icons = []
        let totalProjects = projects.length
        let projectCounter = 0
        
        for (let i = 0; i < projects.length; i++) {
            let project = projects[i]
            
            const folder = global.env.PATH_TO_PROJECTS + '/' + project + '/Icons/'
            
            SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(folder, onFilesReady)
            
            function onFilesReady(files) {
                for (let j = 0; j < files.length; j++) {
                    let file = files[j]
                    for (let i = 0; i < 10; i++) {
                        file = file.replace('/', '\\')
                    }
                    icons.push([project, file])
                }
                
                projectCounter++
                if (projectCounter === totalProjects) {
                    callback(icons)
                }
            }
        }
    }
}