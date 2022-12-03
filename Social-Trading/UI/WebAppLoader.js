
function newWebAppLoader() {

    let thisObject = {
        loadModules: loadModules
    }

    return thisObject

    async function loadModules() {
        try {
            let modulesArray = [
                'WebSocketsWebAppClient.js',
                'WebDebugLog.js',
                'WebApp.js'
            ]

            for (let i = 0; i < UI.schemas.projectSchema.length; i++) {
                let project = UI.schemas.projectSchema[i]

                if (project.UI !== undefined) {
                    if (project.UI.functionLibraries !== undefined) {
                        for (let j = 0; j < project.UI.functionLibraries.length; j++) {
                            let fileName = project.UI.functionLibraries[j].fileName   
                            if (fileName === undefined) {fileName = project.UI.functionLibraries[j].name.replaceAll(' ', '') + '.js'}                     
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'UI' + '/' + 'Function-Libraries' + '/' + fileName)
                        }
                    }
                    if (project.UI.nodeActionFunctions !== undefined) {
                        for (let j = 0; j < project.UI.nodeActionFunctions.length; j++) {
                            let fileName = project.UI.nodeActionFunctions[j].fileName   
                            if (fileName === undefined) {fileName = project.UI.nodeActionFunctions[j].name.replaceAll(' ', '') + '.js'}                     
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'UI' + '/' + 'Node-Action-Functions' + '/' + fileName)
                        }
                    }
                    if (project.UI.systemActionFunctions !== undefined) {
                        for (let j = 0; j < project.UI.systemActionFunctions.length; j++) {
                            let fileName = project.UI.systemActionFunctions[j].fileName   
                            if (fileName === undefined) {fileName = project.UI.systemActionFunctions[j].name.replaceAll(' ', '') + '.js'}                     
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'UI' + '/' + 'System-Action-Functions' + '/' + fileName)
                        }
                    }
                    if (project.UI.utilities !== undefined) {
                        for (let j = 0; j < project.UI.utilities.length; j++) {
                            let fileName = project.UI.utilities[j].fileName        
                            if (fileName === undefined) {fileName = project.UI.utilities[j].name.replaceAll(' ', '') + '.js'}                                     
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'UI' + '/' + 'Utilities' + '/' + fileName)
                        }
                    }
                    if (project.UI.globals !== undefined) {
                        for (let j = 0; j < project.UI.globals.length; j++) {
                            let fileName = project.UI.globals[j].fileName  
                            if (fileName === undefined) {fileName = project.UI.globals[j].name.replaceAll(' ', '') + '.js'}                                                           
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'UI' + '/' + 'Globals' + '/' + fileName)
                        }  
                    }
                    if (project.UI.modules !== undefined) {
                        for (let j = 0; j < project.UI.modules.length; j++) {
                            let fileName = project.UI.modules[j].fileName   
                            if (fileName === undefined) {fileName = project.UI.modules[j].name.replaceAll(' ', '') + '.js'}                                                                                
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'UI' + '/' + 'Modules' + '/' + fileName)
                        }
                    }
                }

                if (project.SA !== undefined) {
                    if (project.SA.functionLibraries !== undefined) {
                        for (let j = 0; j < project.SA.functionLibraries.length; j++) {
                            let fileName = project.SA.functionLibraries[j].fileName   
                            if (fileName === undefined) {fileName = project.SA.functionLibraries[j].name.replaceAll(' ', '') + '.js'}                     
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'SA' + '/' + 'Function-Libraries' + '/' + fileName)
                        }
                    }
                    if (project.SA.utilities !== undefined) {
                        for (let j = 0; j < project.SA.utilities.length; j++) {
                            let fileName = project.SA.utilities[j].fileName        
                            if (fileName === undefined) {fileName = project.SA.utilities[j].name.replaceAll(' ', '') + '.js'}                                     
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'SA' + '/' + 'Utilities' + '/' + fileName)
                        }
                    }
                    if (project.SA.globals !== undefined) {
                        for (let j = 0; j < project.SA.globals.length; j++) {
                            let fileName = project.SA.globals[j].fileName  
                            if (fileName === undefined) {fileName = project.SA.globals[j].name.replaceAll(' ', '') + '.js'}                                                           
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'SA' + '/' + 'Globals' + '/' + fileName)
                        }  
                    }
                    if (project.SA.modules !== undefined) {
                        for (let j = 0; j < project.SA.modules.length; j++) {
                            let fileName = project.SA.modules[j].fileName   
                            if (fileName === undefined) {fileName = project.SA.modules[j].name.replaceAll(' ', '') + '.js'}                                                                                
                            modulesArray.push('Projects' + '/' + project.name + '/' + 'SA' + '/' + 'Modules' + '/' + fileName)
                        }
                    }
                }
            }

            downloadIncludedFiles()

            function downloadIncludedFiles() {

                let downloadedCounter = 0

                for (let i = 0; i < modulesArray.length; i++) {
                    let path = modulesArray[i]

                    REQUIREJS([path], onRequired)

                    function onRequired() {
                        try {

                            downloadedCounter++

                            if (downloadedCounter === modulesArray.length) {
                                setTimeout(() => {
                                    UI.webApp = newWebApp()
                                    UI.webApp.initialize()
                                }, 500)

                            }
                        } catch (err) {
                            console.log((new Date()).toISOString(), '[ERROR] loadModules -> onRequired -> err = ' + err.stack)
                        }
                    }
                }
            }

        } catch (err) {
            console.log((new Date()).toISOString(), '[ERROR] loadModules -> err = ' + err.stack)
        }
    }
}

