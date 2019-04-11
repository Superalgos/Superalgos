exports.newTeamSetup = function newTeamSetup() {

    let thisObject = {
        newTeam: newTeam,
        deleteTeam: deleteTeam,
        initialize: initialize
    }

    let masterAppServerURL, storage

    return thisObject;

    function initialize(pServerConfig, pStorage) {
        masterAppServerURL = pServerConfig.masterAppServerURL
        storage = pStorage
    }

    function newTeam(pTeamCodeName, pTeamDisplayName, pUserName, pBotCodeName, pBotDisplayName, pUserId, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> Entering function."); }

            createContainer();

            function createContainer() {

                if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> createContainer -> Entering function."); }

                storage.createContainer(pTeamCodeName, onContainerCreated);

                function onContainerCreated(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                        console.log("[ERROR] TeamSetup -> newTeam -> createContainer -> onContainerCreated -> Could not create the container. ");
                        console.log("[ERROR] TeamSetup -> newTeam -> createContainer -> onContainerCreated -> err.message = " + err.message);

                        if (err.message === "ContainerAlreadyExists") {

                            let error = {
                                result: err.message,
                                message: "Team Name already taken"
                            };

                            callBackFunction(error);

                        } else {

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                        return;
                    }

                    forkBotCode();
                }
            }

            function forkBotCode() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotCode -> Entering function."); }

                    storage.readData("AATemplate", "bots/BotName-Trading-Bot/Trading-Process", "User.Bot.js", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            let team = pTeamCodeName;
                            let filePath = "bots" + "/" + pBotCodeName + "-Trading-Bot/Trading-Process";
                            let fileName = "User.Bot.js";

                            storage.writeData(team, filePath, fileName, pFileContent, onDataWritten);

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    let team = pTeamCodeName;
                                    let filePath = "members" + "/" + pUserName + "/" + pBotCodeName + "-Trading-Bot/Trading-Process";
                                    let fileName = "User.Bot.js";

                                    storage.writeData(team, filePath, fileName, pFileContent, onDataWritten);

                                    function onDataWritten(err) {

                                        try {

                                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> onDataWritten -> Could not write a file. ");
                                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> onDataWritten -> err.message = " + err.message);

                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                return;
                                            }

                                            forkBotConfig();

                                        } catch (err) {

                                            console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                        }
                                    }

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> newTeam -> forkBotCode -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

            function forkBotConfig() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotConfig -> Entering function."); }

                    storage.readData("AATemplate", "bots/BotName-Trading-Bot", "this.bot.config.json", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            let botConfig = JSON.parse(pFileContent);

                            /*

                            The first thing we are going to replace is the status dependency to iteself. Each trading bots reads its own status report and its
                            dependency can be located anywhere within the status dependency array. We will scan the array for the self dependency and replace
                            that first with the name of the new bot. After that wi will continue replacing the rest of the information.
                            */

                            for (let i = 0; i < botConfig.processes[0].statusDependencies.length; i++) {

                                if (
                                    botConfig.processes[0].statusDependencies[i].devTeam === botConfig.devTeam &&
                                    botConfig.processes[0].statusDependencies[i].bot === botConfig.codeName
                                ) {

                                    botConfig.processes[0].statusDependencies[i].devTeam = pTeamCodeName;
                                    botConfig.processes[0].statusDependencies[i].bot = pBotCodeName;
                                }
                            }

                            // Add simulator dependency
                            let simulatorBotCodeName = "simulator-" + pBotCodeName

                            let statusDependencyMarket = {
                                devTeam: pTeamCodeName,
                                bot: simulatorBotCodeName,
                                botVersion: {
                                    "major": 1,
                                    "minor": 0
                                },
                                process: "Multi-Period-Market",
                                dataSetVersion: "dataSet.V1",
                                type: "Indicator"
                            }
                            botConfig.processes[0].statusDependencies.push(statusDependencyMarket)

                            let statusDependencyDaily = {
                                devTeam: pTeamCodeName,
                                bot: simulatorBotCodeName,
                                botVersion: {
                                    "major": 1,
                                    "minor": 0
                                },
                                process: "Multi-Period-Daily",
                                dataSetVersion: "dataSet.V1",
                                type: "Indicator"
                            }
                            botConfig.processes[0].statusDependencies.push(statusDependencyDaily)

                            let dataDependencyMarket = {
                                devTeam: pTeamCodeName,
                                bot: simulatorBotCodeName,
                                botVersion: {
                                    "major": 1,
                                    "minor": 0
                                },
                                product: "Trading-Simulation",
                                dataSetVersion: "dataSet.V1",
                                dataSet: "Multi-Period-Market"
                            }
                            botConfig.processes[0].dataDependencies.push(dataDependencyMarket)

                            let dataDependencyDaily = {
                                devTeam: pTeamCodeName,
                                bot: simulatorBotCodeName,
                                botVersion: {
                                    "major": 1,
                                    "minor": 0
                                },
                                product: "Trading-Simulation",
                                dataSetVersion: "dataSet.V1",
                                dataSet: "Multi-Period-Daily"
                            }
                            botConfig.processes[0].dataDependencies.push(dataDependencyDaily)

                            botConfig.displayName = pBotDisplayName;
                            botConfig.codeName = pBotCodeName;
                            botConfig.devTeam = pTeamCodeName;
                            botConfig.profilePicture = pBotCodeName + ".png";

                            let fileContent = JSON.stringify(botConfig);

                            let team = pTeamCodeName;
                            let filePath = "bots" + "/" + pBotCodeName + "-Trading-Bot";
                            let fileName = "this.bot.config.json";

                            storage.writeData(team, filePath, fileName, fileContent, onDataWritten);

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    let team = pTeamCodeName;
                                    let filePath = "members" + "/" + pUserName + "/" + pBotCodeName + "-Trading-Bot";
                                    let fileName = "this.bot.config.json";

                                    storage.writeData(team, filePath, fileName, fileContent, onDataWritten);

                                    async function onDataWritten(err) {

                                        try {

                                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> onDataWritten -> Could not write a file. ");
                                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> onDataWritten -> err.message = " + err.message);

                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                return;
                                            }

                                            const newCopySimulator = require("./CopySimulator")
                                            let copySimulator = newCopySimulator.newCopySimulator(storage)
                                            await copySimulator.copySimulator(pTeamCodeName, pBotCodeName, pBotDisplayName)

                                            forkAACloud();

                                        } catch (err) {

                                            console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                        }
                                    }

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

            function forkAACloud() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkAACloud -> Entering function."); }

                    storage.readData("AATemplate", "AACloud", "this.config.json", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            let botConfig = JSON.parse(pFileContent);

                            botConfig.executionList[0].devTeam = pTeamCodeName;
                            botConfig.executionList[0].bot = pBotCodeName;
                            botConfig.executionList[0].repo = pBotCodeName + "-Trading-Bot";

                            let fileContent = JSON.stringify(botConfig);

                            let team = pTeamCodeName;
                            let filePath = "AACloud";
                            let fileName = "this.config.json";

                            storage.writeData(team, filePath, fileName, fileContent, onDataWritten);

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    let team = pTeamCodeName;
                                    let filePath = "members" + "/" + pUserName + "/" + "AACloud";
                                    let fileName = "this.config.json";

                                    storage.writeData(team, filePath, fileName, fileContent, onDataWritten);

                                    function onDataWritten(err) {

                                        try {

                                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> onDataWritten -> Could not write a file. ");
                                                console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> onDataWritten -> err.message = " + err.message);

                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                return;
                                            }

                                            addToSessions();

                                        } catch (err) {

                                            console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                        }
                                    }

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> newTeam -> forkAACloud -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }

            }

            function addToSessions() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToSessions -> Entering function."); }

                    storage.readData("AdvancedAlgos", "AAPlatform", "open.sessions.json", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToSessions -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            pFileContent = pFileContent.trim();
                            let sessions = JSON.parse(pFileContent);
                            let token = createRandomToken();

                            function createRandomToken() {

                                let text = "";
                                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                                for (var i = 0; i < 512; i++)
                                    text += possible.charAt(Math.floor(Math.random() * possible.length));

                                return text;
                            }

                            let newSession = {
                                sessionToken: token,
                                userName: pUserName,
                                devTeams: [
                                    {
                                        codeName: pTeamCodeName,
                                        displayName: pTeamDisplayName,
                                        userBots: [
                                            {
                                                displayName: pBotDisplayName,
                                                codeName: pBotCodeName,
                                                type: "Trading",
                                                repo: pBotCodeName + "-Trading-Bot",
                                                processes: [
                                                    {
                                                        name: "Trading-Process"
                                                    }
                                                ]
                                            }
                                        ],
                                        devTeamDependencies: ["AAMasters", "AAVikings"]
                                    }
                                ],
                                exchangeKeys: [
                                    {
                                        exchange: "Poloniex",
                                        key: "",
                                        secret: ""
                                    }
                                ]
                            };

                            sessions.push(newSession);

                            let fileContent = JSON.stringify(sessions);

                            storage.writeData("AdvancedAlgos", "AAPlatform", "open.sessions.json", fileContent, onDataWritten);

                            addToUserModuleDatabase(token); // NOTE that this function is not properly inserted on the sequence, so if it fails noone will know.

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToSessions -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    addToEcosystem();

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> newTeam -> addToSessions -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

            function addToUserModuleDatabase(pSessionToken) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToUserModuleDatabase -> Entering function."); }


                    const graphqlClient = require('graphql-client')

                    const usersModuleAPI = graphqlClient({
                        url: masterAppServerURL
                    });


                    let variables = {
                        userId: pUserId,
                        sessionToken: pSessionToken
                    };

                    usersModuleAPI.query(`
                    mutation($userId: String, $sessionToken: String){
                    users_UpdateSessionToken(userId: $userId, sessionToken: $sessionToken){
                        id
                        alias
                        }
                    }
                    `, variables, function (req, res) {
                            if (res.status === 401) {
                                console.log('[ERROR] TeamSetup -> newTeam -> Error trying to save the session token at the Users Module');
                                console.log('[ERROR] TeamSetup -> newTeam -> res.status = 401');
                            }
                        }).then(res => {
                            if (res.errors) {
                                console.log('[ERROR] TeamSetup -> newTeam -> Error trying to save the session token at the Users Module');
                                console.log('[ERROR] TeamSetup -> newTeam -> res.errors = ' + res.errors);
                            }
                        }).catch(error => {
                            console.log('Error trying to save the session token at the Users Module');
                            console.log('[ERROR] TeamSetup -> newTeam -> errors = ' + errors);
                        });

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> newTeam -> addToUserModuleDatabase -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

            function addToEcosystem() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToEcosystem -> Entering function."); }

                    storage.readData("AdvancedAlgos", "AAPlatform", "ecosystem.json", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            pFileContent = pFileContent.trim();
                            let ecosystem = JSON.parse(pFileContent);

                            let newTeam = {
                                codeName: pTeamCodeName,
                                displayName: pTeamDisplayName,
                                bots: [
                                    {
                                        "repo": pBotCodeName + "-Trading-Bot",
                                        "configFile": "this.bot.config.json"
                                    },
                                    {
                                        "repo": "simulator-" + pBotCodeName + "-Indicator-Bot",
                                        "configFile": "this.bot.config.json"
                                    }
                                ],
                                "plotters": []
                            };

                            ecosystem.devTeams.push(newTeam);


                            let fileContent = JSON.stringify(ecosystem);

                            storage.writeData("AdvancedAlgos", "AAPlatform", "ecosystem.json", fileContent, onDataWritten);

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> newTeam -> addToEcosystem -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

        } catch (err) {

            console.log("[ERROR] TeamSetup -> newTeam -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

        }
    }

    function deleteTeam(pTeamCodeName, pUserName, pBotCodeName, pUserId, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> Entering function."); }

            deleteContainer();

            function deleteContainer() {

                if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteContainer -> Entering function."); }

                storage.deleteContainer(pTeamCodeName, onContainerDeleted);

                function onContainerDeleted(err) {

                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteContainer -> onContainerDeleted -> Could not delete the container. ");
                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteContainer -> onContainerDeleted -> err.message = " + err.message);

                        if (err.message === "ContainerNotFound") {

                            let error = {
                                result: err.result,
                                message: "Team does not exist"
                            };

                            deleteBotCode(); // Even if the container does not exist we will try to delete the rest of the stuff related to the team.

                        } else {

                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                        return;
                    }

                    deleteBotCode();
                }
            }

            // TODO Fix-Me: this method is trying to remove from the container that was removed by the previous method.
            // It must remove the files from the aaplatform/team-name folder instead
            function deleteBotCode() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteBotCode ->  Entering function."); }

                    let team = pTeamCodeName;
                    let filePath = "bots" + "/" + pBotCodeName + "-Trading-Bot/Trading-Process";
                    let fileName = "User.Bot.js";

                    storage.deleteBlob(team, filePath, fileName, onBlobDeleted);

                    function onBlobDeleted(err) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> Could not delete a file. ");
                                console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> err.message = " + err.message);

                                // Even if this failed we will try to delete the rest of the stuff related to the team.
                            }

                            let team = pTeamCodeName;
                            let filePath = "members" + "/" + pUserName + "/" + pBotCodeName + "-Trading-Bot/Trading-Process";
                            let fileName = "User.Bot.js";

                            storage.deleteBlob(team, filePath, fileName, onBlobDeleted);

                            function onBlobDeleted(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> onBlobDeleted -> Could not delete a file. ");
                                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> onBlobDeleted -> err.message = " + err.message);

                                        // Even if this failed we will try to delete the rest of the stuff related to the team.
                                    }

                                    deleteBotConfig();

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  onBlobDeleted -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotCode ->  err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }

            }

            // TODO Fix-Me: this method is trying to remove from the container that was removed by the previous method.
            // It must remove the files from the aaplatform/team-name folder instead
            function deleteBotConfig() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteBotConfig -> Entering function."); }

                    let team = pTeamCodeName;
                    let filePath = "bots" + "/" + pBotCodeName + "-Trading-Bot";
                    let fileName = "this.bot.config.json";

                    storage.deleteBlob(team, filePath, fileName, onBlobDeleted);

                    function onBlobDeleted(err) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> Could not delete a file. ");
                                console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> err.message = " + err.message);

                                // Even if this failed we will try to delete the rest of the stuff related to the team.
                            }

                            let team = pTeamCodeName;
                            let filePath = "members" + "/" + pUserName + "/" + pBotCodeName + "-Trading-Bot";
                            let fileName = "this.bot.config.json";

                            storage.deleteBlob(team, filePath, fileName, onBlobDeleted);

                            async function onBlobDeleted(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> onBlobDeleted -> Could not delete a file. ");
                                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> onBlobDeleted -> err.message = " + err.message);

                                        // Even if this failed we will try to delete the rest of the stuff related to the team.
                                    }

                                    const newCopySimulator = require("./CopySimulator")
                                    let copySimulator = newCopySimulator.newCopySimulator(storage)
                                    await copySimulator.removeSimulator(pTeamCodeName, pBotCodeName)

                                    deleteAACloud();

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> onBlobDeleted -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> deleteTeam -> deleteBotConfig -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }

            }

            function deleteAACloud() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteAACloud -> Entering function."); }

                    let team = pTeamCodeName;
                    let filePath = "AACloud";
                    let fileName = "this.config.json";

                    storage.deleteBlob(team, filePath, fileName, onBlobDeleted);

                    function onBlobDeleted(err) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> Could not delete a file. ");
                                console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> err.message = " + err.message);

                                // Even if this failed we will try to delete the rest of the stuff related to the team.
                            }

                            let team = pTeamCodeName;
                            let filePath = "members" + "/" + pUserName + "/" + "AACloud";
                            let fileName = "this.config.json";

                            storage.deleteBlob(team, filePath, fileName, onBlobDeleted);

                            function onBlobDeleted(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> onBlobDeleted -> Could not delete a file. ");
                                        console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> onBlobDeleted -> err.message = " + err.message);

                                        // Even if this failed we will try to delete the rest of the stuff related to the team.
                                    }

                                    removeFromSessions();

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> onBlobDeleted -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> deleteTeam -> deleteAACloud -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }

            }

            function removeFromSessions() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromSessions -> Entering function."); }

                    storage.readData("AdvancedAlgos", "AAPlatform", "open.sessions.json", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            pFileContent = pFileContent.trim();
                            let sessions = JSON.parse(pFileContent);

                            for (let i = 0; i < sessions.length; i++) {

                                let session = sessions[i];

                                if (session.userName === pUserName && session.devTeams[0].codeName === pTeamCodeName) {

                                    // Found it! Deleting...

                                    sessions.splice(i, 1);
                                    break;
                                }

                            }

                            let fileContent = JSON.stringify(sessions);

                            storage.writeData("AdvancedAlgos", "AAPlatform", "open.sessions.json", fileContent, onDataWritten);

                            removeFromUserModuleDatabase(""); // NOTE that this function is not properly inserted on the sequence, so if it fails noone will know.

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        // Even if this failed we will try to delete the rest of the stuff related to the team.
                                    }

                                    removeFromEcosystem();

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromSessions -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

            function removeFromUserModuleDatabase(pSessionToken) {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromUserModuleDatabase -> Entering function."); }


                    const graphqlClient = require('graphql-client')

                    const usersModuleAPI = graphqlClient({
                        url: masterAppServerURL
                    });


                    let variables = {
                        userId: pUserId,
                        sessionToken: pSessionToken
                    };

                    usersModuleAPI.query(`
                    mutation($userId: String, $sessionToken: String){
                    users_UpdateSessionToken(userId: $userId, sessionToken: $sessionToken){
                        id
                        alias
                        }
                    }
                    `, variables, function (req, res) {
                            if (res.status === 401) {
                                console.log('[ERROR] TeamSetup -> deleteTeam -> Error trying to delete the session token at the Users Module');
                                console.log('[ERROR] TeamSetup -> deleteTeam -> res.status = 401');
                            }
                        }).then(res => {
                            if (res.errors) {
                                console.log('[ERROR] TeamSetup -> deleteTeam -> Error trying to delete the session token at the Users Module');
                                console.log('[ERROR] TeamSetup -> deleteTeam -> res.errors = ' + res.errors);
                            }
                        }).catch(error => {
                            console.log('Error trying to delete the session token at the Users Module');
                            console.log('[ERROR] TeamSetup -> deleteTeam -> errors = ' + errors);
                        });

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromUserModuleDatabase -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

            function removeFromEcosystem() {

                try {

                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromEcosystem -> Entering function."); }

                    storage.readData("AdvancedAlgos", "AAPlatform", "ecosystem.json", false, onDataRead);

                    function onDataRead(err, pFileContent) {

                        try {

                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> Entering function."); }

                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> Could not read a file. ");
                                console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> err.message = " + err.message);

                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return;
                            }

                            pFileContent = pFileContent.trim();
                            let ecosystem = JSON.parse(pFileContent);

                            for (let i = 0; i < ecosystem.devTeams.length; i++) {

                                let team = ecosystem.devTeams[i];

                                if (team.codeName === pTeamCodeName) {

                                    // Found! Deleting it...

                                    ecosystem.devTeams.splice(i, 1);
                                    break;
                                }
                            }

                            let fileContent = JSON.stringify(ecosystem);

                            storage.writeData("AdvancedAlgos", "AAPlatform", "ecosystem.json", fileContent, onDataWritten);

                            function onDataWritten(err) {

                                try {

                                    if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> onDataWritten -> Entering function."); }

                                    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                        console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> onDataWritten -> Could not write a file. ");
                                        console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> onDataWritten -> err.message = " + err.message);

                                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    callBackFunction(global.DEFAULT_OK_RESPONSE);

                                } catch (err) {

                                    console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> onDataWritten -> err.message = " + err.message);
                                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                                }
                            }

                        } catch (err) {

                            console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> onDataRead -> err.message = " + err.message);
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                        }
                    }

                } catch (err) {

                    console.log("[ERROR] TeamSetup -> deleteTeam -> removeFromEcosystem -> err.message = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);

                }
            }

        } catch (err) {

            console.log("[ERROR] TeamSetup -> deleteTeam -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

        }
    }

}
