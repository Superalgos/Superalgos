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

            /*
    
            Procedure to create a new Team, User and Bot:

            1. Create Continer. This will also tell us if the Team name is not already in use.    FALTA ERROR HANDLING Y EN STORAGE EL LOG DE ERRORS 
            2. Add it to the Ecosystem.
            3. Add it to Sessions.
            

            5. Copiar el bot a devTeam/bots  --> Cambiarle el nombre al folder
            6. Modificar la configuracion del bot reemplazando el devTeam y el Nombre.
            7. Modificar la configuracion del bot en sus status dependecies y data depedencies.   // solo si el bot va a usar otros productos.
            8. Asegurarse de que tenga la data dependency de Bruce para poder obtener el precio del mercado en backtest.
            9. Copiar el bot al directorio del usuario.
            10. Copiar la configuracion del cloud al folder del nuevo team.
            11. Modificarla configuracion de AACloud para detallar el proceso que tiene que correr.
    
            */

            forkBotConfig();

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

                    addToEcosystem();
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

                            botConfig.displayName = pBotName;
                            botConfig.codeName = pBotName;
                            botConfig.devTeam = pTeamCodeName;
                            botConfig.profilePicture = pBotName + ".png";
                            botConfig.processes[0].statusDependencies[1].devTeam = pTeamCodeName;
                            botConfig.processes[0].statusDependencies[1].bot = pBotName;

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

                callBackFunction(global.DEFAULT_OK_RESPONSE);

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

                                    addToSessions();

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

                                for (var i = 0; i < 128; i++)
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

                                    createContainer();

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



        } catch (err) {

            console.log("[ERROR] TeamSetup -> newTeam -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

        }
    }
}