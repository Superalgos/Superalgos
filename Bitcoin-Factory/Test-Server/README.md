To run a server you basically need to setup two workspaces one for mining and for running a server.

Server Workspace
---------------------------------------------------------------------
Edit Test-Server sensor Bot Instance start with setting up the server config with the following: 
{
    "networkCodeName": "Testnet",
    "targetSuperalgosHost": "MACHINES IP ADRESS",
    "targetSuperalgosHttpPort": 34248,
    "pythonScriptName": "Bitcoin_Factory_LSTM.py",
    "serverInstanceName": "YOUR-SERVER-NAME",
    "timeSeriesFile": {
        "labels": [

And edit each indicator you wish to try like below.
Indicator with range "ON" must be mining and up-to-date (from mining  workspace preferably )

            {
                "dataMine": "Delta",
                "indicator": "MFI",
                "product": "MFI",
                "objectName": "mfi",
                "propertyName": "value",
                "range": [
                    "ON"
                ]
            },

Reference Task Server App Reference to an unused task server app in your profile. If you dont have any spare its a good idea to make a few extras and then re-sign you profile, update the plugins repo and then copy the signatures file to the directorys of all superalgos installations you may have

all data is saved inside bitcoin-factory/test server - please backup anything from this folder before deleting because we may need the test case csv file to add to the work completed for governance


Mining Workspace
---------------------------------------------------------------------
Make sure indicators are running and up to date


---------------------------------------------------------------------
Random Notes:

1. You can not turn off the minimun 3 labels: Candle Close, Max, Min and 1 Feature: Candle Open. At the Test Server config all this must be ON.
2. Remember that the Test Cases Array JSON file is generated once the first time the Test Server run and does not detect that this file exists. If you change the config adding or removing ON / OFF switches for indicators, you need to manually delete this file and the FForecast Cases Array file so that the Test Server generates it again. Failing to do so will produce errors executing the tests at the Docker container, since dimensions for reshapes will not match, since they were calculated at the moment this file was generated but the changed config produces datasets with other amount of data.

