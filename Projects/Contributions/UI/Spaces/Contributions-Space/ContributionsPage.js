function newContributionsContributionsPage() {
    let thisObject = {
        repoStatus: undefined,
        githubUsername: undefined,
        githubToken: undefined,
        commandStatus: '',
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
        // Github Credentials
        HTML += '<div><span class="credentials-title">Github Credentials</span><button id="credentials-collapse" type="button" class="contributions-collapsible-element"></button></div><div id="credentials-box" class="credentials-box"><input id="username-input" type="text" class="credentials-input"></input><input id="token-input" type="password" class="credentials-input"></input><button id="credentials-save-button" class="credentials-save-button">Save</button></div><hr>'
        // Main buttons
        HTML += '<div class="contributions-top-buttons-div"><button id="contribute-all" class="contributions-top-buttons">Contribute All</button><button id="update" class="contributions-top-buttons">Update</button><button id="reset" class="contributions-top-buttons">Reset</button><div id="command-status" class="command-status">' + thisObject.commandStatus + '</div></div>'
        
        // Repo Handling 
        let fileNamesRepoAndPath = []
        let repoNames = []
        let fileName
        for (const stat of thisObject.repoStatus) {
            // Overall diff in repo
            HTML += '<div class="repo-title"><span class="docs-h3">' + stat[0] + '</span>' + '<span><span>Files Changed: ' + JSON.stringify(stat[1].changed) + ' </span><span class="insertion"> Insertions: ' + JSON.stringify(stat[1].insertions) +' </span><span class="deletion"> Deletions: ' + JSON.stringify(stat[1].deletions) + ' </span></span></div>'
            HTML += '<div class="contribute-box"><input id="' + stat[0] + '-input" type="text" class="contributions-input" placeholder="Type a commit message for these changes here" spellcheck="false" autocapitalize="false"></input><button id="' + stat[0] + '-contribute-button" class="credentials-save-button">Contribute</button></div>'
            repoNames.push(stat[0])

            // File diff object 
            for (const file of stat[1].files) {
                
                fileName = file.file.split("/").pop()
                fileNamesRepoAndPath.push([fileName, stat[0], file.file])
                HTML += '<div id="' + fileName + '" class="file-Object"><div><strong>File: </Strong>' + fileName + '</div>' 
                HTML += '<div><strong>Path: </Strong>' + file.file + '</div>' 
                HTML += '<div> <span class="insertion"> Insertions: ' + JSON.stringify(file.insertions) + '</span> <span class="deletion"> Deletions: ' + JSON.stringify(file.deletions) +  '</span> <span class="total-changes">Total Changes: ' + JSON.stringify(file.changes) + '</span></div>'
                HTML += '<button id="' + fileName + '-button" class="contributions-button">Discard Changes</button></div>'
            }
            HTML += '<hr>'
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
            thisObject.githubToken = "Enter your Github Token here"
        }    
        document.getElementById('username-input').value = thisObject.githubUsername
        document.getElementById('token-input').value = thisObject.githubToken

        // Make credentials elements collapsable 
        document.getElementById('credentials-collapse').addEventListener("click", function() {
            this.classList.toggle("contributrions-collapsible-active");
            var content = document.getElementById('credentials-box')
            if (content.style.display === "flex") {
              content.style.display = "none";
            } else {
              content.style.display = "flex";
            }
          })

        // Attach listener to Credentials save button
        document.getElementById('credentials-save-button').addEventListener('click', saveCreds)

        //Attach listeners and animation to Main Buttons 
        document.getElementById('contribute-all').addEventListener('click', contributeAll)
        document.getElementById('update').addEventListener('click', update)
        document.getElementById('reset').addEventListener('click', resetRepo)


        // Attach event listeners to all single project contribute buttons
        for (const repo of repoNames) {
            document.getElementById(repo + '-contribute-button').addEventListener('click', function () {contributeSingleRepo(repo)})
        }

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

    function setCommandStatus(message) {
        // Display success message
        // Note: command status is used to keep displaying success message as the animation loop runs 
        thisObject.commandStatus = message
        document.getElementById("command-status").innerHTML = message
                
        // Clear animation after time
        setTimeout(function () {
            thisObject.commandStatus = ''
            document.getElementById("command-status").innerHTML = ""
        }, 6000)
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
                setCommandStatus("Something went wrong! Check the Console")               
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
                setCommandStatus("Something went wrong! Check the Console")           
                }
            }
    }

    function saveCreds() {
        // Gather new creds from the UI
        thisObject.githubUsername = document.getElementById('username-input').value
        thisObject.githubToken = document.getElementById('token-input').value

        setCommandStatus("Saving....")  
        httpRequest(undefined, 'App/SaveCreds/' + thisObject.githubUsername + '/' + thisObject.githubToken, onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                setCommandStatus("Credentials saved successfully!")  

            } else {
                setCommandStatus("Something went wrong! Check the Console")  
                }
            }
    }
    
    function discardChange(repo, filePath) {

        setCommandStatus("Discarding....")  
        httpRequest(undefined, 'App/Discard/' + repo + "/" + filePath, onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                reset()
                setCommandStatus("Changes discarded")  
        
            } else {
                setCommandStatus("Something went wrong! Check the Console")             
                }
            }
    }

    function update() {
        setCommandStatus("Updating....")  
        httpRequest(undefined, 'App/Update/' +  UI.projects.education.spaces.docsSpace.currentBranch, onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.CUSTOM_OK_RESPONSE.result) {
                //TODO: need to iterate through returned message in data result to give more specific result messages 
                setCommandStatus("Updated Succesfully!") 
                
            } else {
                setCommandStatus("Something went wrong! Check the Console")          
            }
        }
    }

    function resetRepo() {
           
        setCommandStatus("Resetting Repository....") 
        httpRequest(undefined, 'App/Reset/' + UI.projects.education.spaces.docsSpace.currentBranch, onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            console.log(data, err, GLOBAL.DEFAULT_OK_RESPONSE)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log("Everything is reset!")
                reset()
                setCommandStatus("Everything has been Reset!") 
    
                } else {
                    setCommandStatus("Something went wrong! Check the console")          
                }
            }
    }

    function contributeAll() {
        let messageArray = []
        let messages = document.getElementsByClassName('contributions-input')
        let repoName
        for (let message of messages) {
            //Only deal with filled commit lines
            if (message.value.length > 0) {
                repoName = message.id.replace('-input', '').replace('-Plugins', '')
                console.log('Contributiong to' + repoName + ': ' + message.value + '\n')
                messageArray.push([repoName, message.value])
            }
        }

        // Fall back commit message if nothing is entered 
        if (messageArray.size === 0) {
            let messageToSend = "This is my contribution to Superalgos"
            messageArray.set(repoName, messageToSend)
        }
        
        // Make sure Github credentials have been filled out
        if (thisObject.githubUsername === "Enter your Github Username here" || thisObject.githubToken === "Enter your Github Token here") {
            setCommandStatus("No Github Credentials! Please add them and try again.") 
            return
        }

        setCommandStatus("Contributing all changes....") 
        httpRequest(
            undefined,
            'App/Contribute/' +
            JSON.stringify([...messageArray]) + '/' +
            thisObject.githubUsername + '/' +
            thisObject.githubToken + '/' +
            UI.projects.education.spaces.docsSpace.currentBranch + '/' +
            UI.projects.education.spaces.docsSpace.contributionsBranch
            , onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log("Everything has beene Contributed!")
                reset()
                setCommandStatus("Everything has been Contributed!") 
    
                } else {
                    setCommandStatus("Something went wrong! Check the console")          
                }
            }
    }

    function contributeSingleRepo(repoName) {
        let messageToSend = ''
        let message = document.getElementById(repoName + '-input')
        
        console.log('Contributing to ' + repoName + ': ' + message.value)

        if (message.value.length > 0) {
            messageToSend = message.value
        }
        
        // Fall back commit message if nothing is entered 
        if (messageToSend === '') {
            messageToSend = "This is my contribution to Superalgos"
        }

        // Make sure Github credentials have been filled out
        if (thisObject.githubUsername === "Enter your Github Username here" || thisObject.githubToken === "Enter your Github Token here") {
            setCommandStatus("No Github Credentials! Please add them and try again.") 
            return
        }
           
        setCommandStatus("Contributing changes....") 
        httpRequest(
            undefined,
            'App/ContributeSingleRepo/' +
            messageToSend + '/' +
            thisObject.githubUsername + '/' +
            thisObject.githubToken + '/' +
            UI.projects.education.spaces.docsSpace.currentBranch + '/' +
            UI.projects.education.spaces.docsSpace.contributionsBranch + '/' +
            repoName.replace('-Plugins', '')
            , onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log("Changes Contributed!")
                reset()
                setCommandStatus("Changes Contributed!") 
    
                } else {
                    setCommandStatus("Something went wrong! Check the console")          
                }
            }
    }

}