exports.newTeamSetup = function newTeamSetup() {

    CONSOLE_LOG = true;
    LOG_FILE_CONTENT = false;

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
    
            1. Add it to the Ecosystem.
            2. Agregarlo al archivo de sessiones.  --> copiar la session local a Develop
            3. Crear el container del nuevo devTeam.
            4. Crear el folder del nuevo devTeam en el container aaplatform.
            5. Copiar el bot a devTeam/bots  --> Cambiarle el nombre al folder
            6. Modificar la configuracion del bot reemplazando el devTeam y el Nombre.
            7. Modificar la configuracion del bot en sus status dependecies y data depedencies.   // solo si el bot va a usar otros productos.
            8. Asegurarse de que tenga la data dependency de Bruce para poder obtener el precio del mercado en backtest.
            9. Copiar el bot al directorio del usuario.
            10. Copiar la configuracion del cloud al folder del nuevo team.
            11. Modificarla configuracion de AACloud para detallar el proceso que tiene que correr.
    
            */

            addToEcosystem();

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


            }

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {

            console.log("[ERROR] TeamSetup -> newTeam -> err.message = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);

        }
    }
}