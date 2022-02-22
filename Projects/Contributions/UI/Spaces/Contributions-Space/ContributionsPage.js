function newContributionsContributionsPage() {
    let thisObject = {
        repoStatus: undefined,
        githubUsername: undefined,
        githubToken: undefined,
        reset:reset,
        initialize: initialize,
        finalize: finalize,
        getStatus: getStatus,
        discardChange: discardChange,
        getCreds: getCreds
    }

    // add needed variables here let monacoInitialized = false

    return thisObject


    function initialize() {
        getCreds()
        getStatus()
    }


    function finalize() {
        // garbage collect variables here
        thisObject.repoStatus = undefined
        thisObject.githubUsername = undefined
        thisObject.githubToken = undefined

    }

    function reset() {
        finalize()
        initialize()
    }

    function buildEditorHTML() {
        let HTML = ''

        HTML += `<section id="contributions-editor-page" class="contributions-editor-page">`

        //Page Header
        HTML += '<div class="governance-report-page-header">'
        HTML += '<div class="governance-image-logo-report-page"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML += '</div>'
        HTML += `<div class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2"> Contributions Editor</h2></div><div id="projectImageDiv" class="docs-image-container"><img src="Icons/Foundations/github.png" width="50" height="50"></div></div>`
        
        // Page content
        HTML += '<div class="contributions-common-style-container" id="contributions">'
        HTML += '<div class="credentials-title">Github Credentials</div><div class="credentials-box"><input id="username-input" type="text" class="credentials-input"></input><input id="token-input" type="password" class="credentials-input"></input><button id="credentials-save-button" class="credentials-save-button">Save</button></div><hr>'
        HTML += '<div class="contributions-top-buttons-div"><button class="contributions-top-buttons">Contribute</button><button class="contributions-top-buttons">Update</button><button class="contributions-top-buttons">Reset</button></div>'
        
        let fileNamesRepoAndPath = []
        let fileName
        for (const stat of thisObject.repoStatus) {
            // Overall diff in repo
            HTML += '<div class="repo-title"><span class="docs-h3">' + stat[0] + '</span>' + '<span><span>Files Changed: ' + JSON.stringify(stat[1].changed) + ' </span><span class="insertion"> Insertions: ' + JSON.stringify(stat[1].insertions) +' </span><span class="deletion"> Deletions: ' + JSON.stringify(stat[1].deletions) + ' </span></span></div><hr>'
           
            // File diff object 
            for (const file of stat[1].files) {
                
                fileName = file.file.split("/").pop()
                fileNamesRepoAndPath.push([fileName, stat[0], file.file])
                HTML += '<div id="' + fileName + '" class="file-Object"><div><strong>File: </Strong>' + fileName + '</div>' 
                HTML += '<div><strong>Path: </Strong>' + file.file + '</div>' 
                HTML += '<div> <span class="insertion"> Insertions: ' + JSON.stringify(file.insertions) + '</span> <span class="deletion"> Deletions: ' + JSON.stringify(file.deletions) +  '</span> <span class="total-changes">Total Changes: ' + JSON.stringify(file.changes) + '</span></div>'
                HTML += '<button id="' + fileName + '-button" class="contributions-button">Discard Changes</button></div>'
            }
        }
        
        HTML +='</div>'
        HTML += `</section>`

        HTML += footer()
        document.getElementById('contributions-content-div').innerHTML = HTML

        //Load github credentials into input fields 
        if (thisObject.githubUsername === undefined) {
            thisObject.githubUsername = "Enter your Github Username here"
        }      

        if (thisObject.githubToken === undefined) {
            thisObject.githubUsername = "Enter your Github Token here"
        }    
        document.getElementById('username-input').value = thisObject.githubUsername
        document.getElementById('token-input').value = thisObject.githubToken

        // Attache listener to Credentials save button
        document.getElementById('credentials-save-button').addEventListener('click', saveCreds)

        // Attach event listeners for all Discard buttons
        for(const file of fileNamesRepoAndPath) {
            document.getElementById(file[0] + '-button').addEventListener('click', function() {discardChange(file[1], file[2])})
        }
        

    }


    function footer() {
        let HTML = ''

        HTML += '<div id="governance-footer" class="governance-node-html-footer-container">' // Container Starts

        // Buttons Section

        HTML += '<div class="governance-node-html-footer-table">'

        HTML += '<div height="100%" class="governance-footer-row">'

        HTML += '<div class="governance-footer-cell">'
        HTML += '<img src="Images/superalgos-logo-white.png" width="200 px" style="margin-bottom: 500px">'
        HTML += '</div>'

        HTML += '</div>'

        HTML += '</div>' // Container Ends

        return HTML
    }

    function getStatus() {
        httpRequest(undefined, 'App/Status', onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                thisObject.repoStatus = data
                // Render information by rebuilding html
                buildEditorHTML()
                        
            } else {
                // will need to open docs space to display this error 
                UI.projects.education.spaces.docsSpace.navigateTo(
                    data.docs.project,
                    data.docs.category,
                    data.docs.type,
                    data.docs.anchor,
                    undefined,
                    data.docs.placeholder
                    )               
                }
            }
    }

    function discardChange(repo, filePath) {
        httpRequest(undefined, 'App/Discard/' + repo + "/" + filePath, onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                reset()
        
            } else {
                // will need to open docs space to display this error 
                UI.projects.education.spaces.docsSpace.navigateTo(
                    data.docs.project,
                    data.docs.category,
                    data.docs.type,
                    data.docs.anchor,
                    undefined,
                    data.docs.placeholder
                    )               
                }
            }
    }

    function getCreds() {
        httpRequest(undefined, 'App/GetCreds', onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                // Save creds in objects
                thisObject.githubUsername = data.githubUsername
                thisObject.githubToken = data.githubToken

            } else {
                // will need to open docs space to display this error 
                UI.projects.education.spaces.docsSpace.navigateTo(
                    data.docs.project,
                    data.docs.category,
                    data.docs.type,
                    data.docs.anchor,
                    undefined,
                    data.docs.placeholder
                    )               
                }
            }
    }

    function saveCreds() {
        httpRequest(undefined, 'App/SaveCreds/' + thisObject.githubUsername + '/' + thisObject.githubToken, onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log("everything is saved!")

            } else {
                // will need to open docs space to display this error 
                UI.projects.education.spaces.docsSpace.navigateTo(
                    data.docs.project,
                    data.docs.category,
                    data.docs.type,
                    data.docs.anchor,
                    undefined,
                    data.docs.placeholder
                    )               
                }
            }
    }
}