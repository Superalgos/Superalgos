exports.newTeamSetup = function newTeamSetup() {

    let thisObject = {
        newTeam: newTeam,
        initialize: initialize
    }

    let storage;

    return thisObject;

    function initialize(pServerConfig) {

        const STORAGE = require('../Server/Storage');
        storage = STORAGE.newStorage();

        storage.initialize(undefined, pServerConfig);

    }

    function newTeam(pTeamCodeName, pTeamDisplayName, pUserName, pBotName, callBackFunction) {

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

                            let err = {
                                resutl: global.CUSTOM_FAIL_RESPONSE.result,
                                message: "Team Name already taken"
                            };

                            callBackFunction(err);

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
                            let filePath = "bots" + "/" + pBotName + "-Trading-Bot/Trading-Process";
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
                                    let filePath = "members" + "/" + pUserName + "/" + pBotName + "-Trading-Bot/Trading-Process";
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
                                    botConfig.processes[0].statusDependencies[i].bot = pBotName;

                                }
                            }

                            botConfig.displayName = pBotName;
                            botConfig.codeName = pBotName;
                            botConfig.devTeam = pTeamCodeName;
                            botConfig.profilePicture = pBotName + ".png";
                            
                            let fileContent = JSON.stringify(botConfig);

                            let team = pTeamCodeName;
                            let filePath = "bots" + "/" + pBotName + "-Trading-Bot";
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
                                    let filePath = "members" + "/" + pUserName + "/" + pBotName + "-Trading-Bot";
                                    let fileName = "this.bot.config.json";

                                    storage.writeData(team, filePath, fileName, fileContent, onDataWritten);

                                    function onDataWritten(err) {

                                        try {

                                            if (CONSOLE_LOG === true) { console.log("[INFO] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> Entering function."); }

                                            if (err.result !== global.DEFAULT_OK_RESPONSE.result) {

                                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> onDataWritten -> Could not write a file. ");
                                                console.log("[ERROR] TeamSetup -> newTeam -> forkBotConfig -> onDataRead -> onDataWritten -> onDataWritten -> err.message = " + err.message);

                                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                                return;
                                            }

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
                            botConfig.executionList[0].bot = pBotName;
                            botConfig.executionList[0].repo = pBotName + "-Trading-Bot";

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
                                                displayName: pBotName,
                                                codeName: pBotName,
                                                type: "Trading",
                                                repo: pBotName + "-Trading-Bot",
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
                                        "repo": pBotName + "-Trading-Bot",
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
}