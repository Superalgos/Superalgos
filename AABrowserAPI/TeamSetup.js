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
            
            4. Crear el folder del nuevo devTeam en el container aaplatform.
            5. Copiar el bot a devTeam/bots  --> Cambiarle el nombre al folder
            6. Modificar la configuracion del bot reemplazando el devTeam y el Nombre.
            7. Modificar la configuracion del bot en sus status dependecies y data depedencies.   // solo si el bot va a usar otros productos.
            8. Asegurarse de que tenga la data dependency de Bruce para poder obtener el precio del mercado en backtest.
            9. Copiar el bot al directorio del usuario.
            10. Copiar la configuracion del cloud al folder del nuevo team.
            11. Modificarla configuracion de AACloud para detallar el proceso que tiene que correr.
    
            */

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

                    addToEcosystem();
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