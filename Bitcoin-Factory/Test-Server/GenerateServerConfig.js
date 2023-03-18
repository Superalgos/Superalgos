const path = require("path");
const fs = require("fs");



/* Here we define constants to help with generating the json file */
const networkCodeName = "Testnet";
const targetSuperalgosHost = "localhost";
const targetSuperalgosHttpPort = 34248;
const labels = [
        {
            "dataMine": "Candles",
            "indicator": "Candles-Volumes",
            "product": "Candles",
            "objectName": "candle",
            "propertyName": "max",
            "range": [
                "ON"
            ]
        },
        {
            "dataMine": "Candles",
            "indicator": "Candles-Volumes",
            "product": "Candles",
            "objectName": "candle",
            "propertyName": "min",
            "range": [
                "ON"
            ]
        },
        {
            "dataMine": "Candles",
            "indicator": "Candles-Volumes",
            "product": "Candles",
            "objectName": "candle",
            "propertyName": "close",
            "range": [
                "ON"
            ]
        }
    ];

const parametersRanges = {
    "LIST_OF_ASSETS": [
        [
            "BTC"
        ]
    ],
    "LIST_OF_TIMEFRAMES": [
        [
            "01-hs"
        ]
    ],
    "NUMBER_OF_LAG_TIMESTEPS": [
        10
    ],
    "PERCENTAGE_OF_DATASET_FOR_TRAINING": [
        80
    ],
    "NUMBER_OF_EPOCHS": [
        750
    ],
    "NUMBER_OF_LSTM_NEURONS": [
        50
    ]
};

const FEATURES = [
    {
        "parameter": "HOUR_OF_DAY",
        "range": [
            "OFF"
        ]
    },
    {
        "parameter": "DAY_OF_MONTH",
        "range": [
            "OFF"
        ]
    },
    {
        "parameter": "DAY_OF_WEEK",
        "range": [
            "OFF"
        ]
    },
    {
        "parameter": "WEEK_OF_YEAR",
        "range": [
            "OFF"
        ]
    },
    {
        "parameter": "MONTH_OF_YEAR",
        "range": [
            "OFF"
        ]
    },
    {
        "parameter": "YEAR",
        "range": [
            "OFF"
        ]
    },
    {
        "dataMine": "Candles",
        "indicator": "Candles-Volumes",
        "product": "Candles",
        "objectName": "candle",
        "propertyName": "open",
        "range": [
            "ON"
        ]
    },
    {
        "dataMine": "Candles",
        "indicator": "Candles-Volumes",
        "product": "Volumes",
        "objectName": "volume",
        "propertyName": "buy",
        "range": [
            "ON"
        ]
    },
];




// We get the path to the plugins folder
let thisPath;
if (process.env.PACKAGED_PATH) {
    thisPath = process.env.PACKAGED_PATH
} else {
    thisPath = __dirname
};

let basePath = path.join(thisPath, '../..');
let DATA_MINES = path.join(basePath, './Plugins/Data-Mining/Data-Mines');


/* Starts here. */
buildServerConfig();



// This function gathers all needed data and then calls the generate function to generate and save the config file.
function buildServerConfig() {

    let features = FEATURES;
    let dataMineCounter = 0;
    let fileSaveCount = 0;

    // We go through all data mine plugins and gather the required data. First we enter the folder holding all plugin data mines.
    fs.readdir(DATA_MINES, (err, dataMines) => {
        if (err) {
            console.error('Error reading folder:', err);
            return;
        }

        let dataMinesLength = dataMines.length;

        // We grab each data mine and enter it.
        dataMines.forEach(dataMine => {
            dataMineCounter++;
            // We get the Data Mine Name
            let dataMineName = dataMine.replace('.json', '');
            // If its the candles data mine we will skip it.
            if (dataMineName == "Candles") {
                return;
            }

            // Entering data mine
            fs.readFile(path.join(DATA_MINES, dataMine), 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }

                const fileData = JSON.parse(data);

                // Here we enter each indicator in the data mine
                fileData.indicatorBots.forEach(indicator => {

                    // We get the indicators name
                    let indicatorName = JSON.parse(indicator.config).codeName;

                    let products = indicator.products;

                    products.forEach(product => {

                        let productConfig = JSON.parse(product.config);

                        let productName = productConfig.codeName;
                        let objectName = productConfig.singularVariableName;
                        let recordProperties = product.record.properties;

                        // We enter each record property for the product.
                        recordProperties.forEach(property => {
                            if (property.name !== "Begin" && property.name !== "End") {

                                // We get the codeName from this property
                                let propertyConfig = JSON.parse(property.config);
                                let propertyName = propertyConfig.codeName;

                                // We check that no names have spaces in them.
                                if (dataMineName.includes(" ") ||
                                    indicatorName.includes(" ") ||
                                    productName.includes(" ") ||
                                    objectName.includes(" ") ) {
                                        console.log("Skipping indicators that have spaces in the name.");
                                        return;
                                    }

                                // Here we assemble the gathered data to add to the new config file.
                                let configEntry = {
                                    "dataMine": dataMineName,
                                    "indicator": indicatorName,
                                    "product": productName,
                                    "objectName": objectName,
                                    "propertyName": propertyName,
                                    "range": [
                                        "OFF"
                                    ]
                                };

                                // We add the new entry to our features list.
                                features.push(configEntry);
                            }
                        });
                    });
                });
                // If this is the last data mine we move forward and generate the file.
                if (dataMineCounter === dataMinesLength) {
                    fileSaveCount++;
                    if (fileSaveCount === dataMinesLength - 1) {
                        generateServerConfig(features);
                    }
                }
            });
        });
    });
}


// This function assembles and saves the new TestServerConfig.json file.
function generateServerConfig(features) {

    let configFile = {
        "networkCodeName": networkCodeName,
        "targetSuperalgosHost": targetSuperalgosHost,
        "targetSuperalgosHttpPort": targetSuperalgosHttpPort,
        "serverInstanceName": "Server Name Here",
        "timeSeriesFile": {
            "labels": labels,
            "features": features
        },
        "librariesIndicators": [],
        "parametersRanges": parametersRanges
    };

    let fileToSave = JSON.stringify(configFile, null, 2);

    // Saving file
    fs.writeFile('TestServerConfig.json', fileToSave, 'utf8', (err) => {
        if (err) {
            console.error(err);
        } else {
            console.log("Test Server config file saved under /Superalgos/Bitcoin-Factory/Test-Server/TestServerConfig.json");
        };
    });
}