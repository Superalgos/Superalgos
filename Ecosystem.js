
function newEcosystem() {

    let ecosystem = {
        getTeam: getTeam,
        getBot: getBot,
        getProduct: getProduct,
        getLayer: getLayer,
        getLayers: getLayers,
        getExchange: getExchange, 
        initialize: initialize
    }
 
    const ECOSYSTEM = {
        devTeams:
        [{
            codeName: "AAMasters",
            organization: {
                name: "AAMasters",
                type: "Open Source Community",
                displayName: "AA Masters",
                location: "Global",
                leader: "Luis Molina",
                logo: "AAMasters.jpg"
            },
            teamMembers: 

                [{
                    member: {
                        displayName: "Luis Molina",
                        githubUsername: "Luis-Fernando-Molina",
                        profilePicture: "Luis.jpg",
                        tokens: {
                            percentDistribution: 100,
                            totalCollected: 121.45
                        }
                    }
                }]
            ,
            bots: 
            [
                {
                    codeName: "AAOlivia",
                    displayName: "Olivia",
                    type: "Indicator",
                    version: {
                        number: "1.0.0",
                        status: "Mantained", // Discontinued
                    },
                    products: [{
                        codeName: "Market Candles",
                        displayName: "Market Candles per Period",
                        description: "A set of files per period that contains all candles of one whole market.",
                        storageAccount: "aaolivia",
                        filePath: "@Exchange/Output/Candles/Multi-Period-Market/@Period",
                        fileName: "@AssetA_@AssetB.json",
                        exchangeList: {
                            exchange: [{
                                name: "Poloniex",
                                datetimeRange: {
                                    minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                    maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                }
                            }]
                        },
                        layers: [{
                            codeName: "Market Candlesticks",
                            displayName: "Candlesticks",
                            exchangeList: ["Poloniex"],
                            validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                            plotter: {
                                devTeam: "AAMasters",
                                repo: "AAOlivia-Plotter",
                                moduleName: "Candles",
                                target: "Timeline"
                            }
                        }]
                        }
                        , {
                            codeName: "Market Volumes",
                            displayName: "Market Volumes per Period",
                            description: "A set of files per period that contains all volumes of one whole market.",
                            storageAccount: "aaolivia",
                            filePath: "@Exchange/Output/Volumes/Multi-Period-Market/@Period",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: [{
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }]
                            },
                            layers: [{
                                codeName: "Market Volumes",
                                displayName: "Volumes",
                                exchangeList: ["Poloniex"],
                                validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                                plotter: {
                                    devTeam: "AAMasters",
                                    repo: "AAOlivia-Plotter",
                                    moduleName: "Volumes",
                                    target: "Timeline"
                                }
                            }]
                        }, {
                            codeName: "Daily Candles",
                            displayName: "Daily Candles per Period",
                            description: "A set of files per period that contains all candles of one whole market.",
                            storageAccount: "aaolivia",
                            filePath: "@Exchange/Output/Candles/Multi-Period-Daily/@Period/@Year/@Month/@Day",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: [{
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }]
                            },
                            layers:[{
                                codeName: "Daily Candlesticks",
                                displayName: "Candlesticks",
                                exchangeList: ["Poloniex"],
                                validPeriods: ["45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"],
                                plotter: {
                                    devTeam: "AAMasters",
                                    repo: "AAOlivia-Plotter",
                                    moduleName: "Candlesticks",
                                    target: "Timeline"
                                }
                            }]
                        }, {
                            codeName: "Daily Volumes",
                            displayName: "Daily Volumes per Period",
                            description: "A set of files per period that contains all volumes of one whole market.",
                            storageAccount: "aaolivia",
                            filePath: "@Exchange/Output/Volumes/Multi-Period-Daily/@Period/@Year/@Month/@Day",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: [{
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }]
                            },
                            layers: [{
                                codeName: "Daily Volumes",
                                displayName: "Volumes",
                                exchangeList: ["Poloniex"],
                                validPeriods: ["45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"],
                                plotter: {
                                    devTeam: "AAMasters",
                                    repo: "AAOlivia-Plotter",
                                    moduleName: "Volumes",
                                    target: "Timeline"
                                }
                            }]
                        }]
                    ,
                    processes:
                    {
                        process: [{
                            name: "One-Min-Daily-Candles-Volumes",
                            description: "Read trades files and generates one minute candles and volumes files for each day."
                        }]
                    },
                    directDependencies: [],
                    directDependents: [],
                    collaboratorsList: [],
                    github: {
                        org: "AAMasters",
                        repos: {
                            repo: [{
                                name: "AABruce",
                                description: "Produces two data-sets with candles and volumes for all markets at all exchanges.",
                                openIssues: 0,
                                openPullRequests: 0,
                                contributors: 1
                            }]
                        }
                    },
                    storage: {
                        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=rl&se=2018-12-31T02:34:32Z&st=2018-02-01T18:34:32Z&spr=https,http&sig=24UJjGDVpPrHjhBoZtt3iKj4sxgenfSV4VTJD2v0q1U%3D',
                        fileUri: 'https://' + 'aaolivia' + '.file.core.windows.net'
                    }
                },
                {
                    codeName: "AATom",
                    displayName: "Tom",
                    type: "Indicator",
                    version: {
                        number: "1.0.0",
                        status: "Mantained", // Discontinued
                    },
                    products:[{
                        codeName: "Market Candle-Stairs",
                        displayName: "Market Candle-Stairs per Period",
                        description: "A set of files per period that contains all candle-stairs of one whole market.",
                        storageAccount: "aatom",
                        filePath: "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Market/@Period",
                        fileName: "@AssetA_@AssetB.json",
                        exchangeList: {
                            exchange: [{
                                name: "Poloniex",
                                datetimeRange: {
                                    minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                    maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                }
                            }]
                        },
                        layers: [{
                            codeName: "Market Candle-Stairs",
                            displayName: "Candle-Stairs",
                            exchangeList: ["Poloniex"],
                            validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                            plotter: {
                                devTeam: "AAMasters",
                                repo: "AATom-Plotter",
                                moduleName: "CandleStairs",
                                target: "Timeline"
                            }
                        }]
                    }, {
                        codeName: "Market Volume-Stairs",
                        displayName: "Market Volume-Stairs per Period",
                        description: "A set of files per period that contains all volume-stairs of one whole market.",
                        storageAccount: "aaolivia",
                        filePath: "@Exchange/Tom/dataSet.V1/Output/Volume-Stairs/Multi-Period-Market/@Period",
                        fileName: "@AssetA_@AssetB.json",
                        exchangeList: {
                            exchange: [{
                                name: "Poloniex",
                                datetimeRange: {
                                    minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                    maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                }
                            }]
                        },
                        layers:  [{
                            codeName: "Market Volume-Stairs",
                            displayName: "Volume-Stairs",
                            exchangeList: ["Poloniex"],
                            validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                            plotter: {
                                devTeam: "AAMasters",
                                repo: "AATom-Plotter",
                                moduleName: "VolumeStairs",
                                target: "Timeline"
                            }
                        }]
                        }, {
                            codeName: "Daily Candle-Stairs",
                            displayName: "Daily Candle-Stairs per Period",
                            description: "A set of files per period that contains all candle-stairs of one whole market.",
                            storageAccount: "aatom",
                            filePath: "@Exchange/Tom/dataSet.V1/Output/Candle-Stairs/Multi-Period-Daily/@Period/@Year/@Month/@Day",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: [{
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                }
                            }]
                            },
                            layers: [{
                                    codeName: "Daily Candle-Stairs",
                                    displayName: "Candle-Stairs",
                                    exchangeList: ["Poloniex"],
                                    validPeriods: ["45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"],
                                    plotter: {
                                        devTeam: "AAMasters",
                                        repo: "AATom-Plotter",
                                        moduleName: "CandleStairs",
                                        target: "Timeline"
                                    }
                                }]
                        }, {
                            codeName: "Daily Volume-Stairs",
                            displayName: "Daily Volume-Stairs per Period",
                            description: "A set of files per period that contains all volume-stairs of one whole market.",
                            storageAccount: "aaotom",
                            filePath: "@Exchange/Tom/dataSet.V1/Output/Volume-Stairs/Multi-Period-Daily/@Period/@Year/@Month/@Day",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: [{
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }]
                            },
                            layers: [{
                                codeName: "Daily Volume-Stairs",
                                displayName: "Volume-Stairs",
                                exchangeList: ["Poloniex"],
                                validPeriods: ["45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"],
                                plotter: {
                                    devTeam: "AAMasters",
                                    repo: "AATom-Plotter",
                                    moduleName: "VolumeStairs",
                                    target: "Timeline"
                                }
                            }]
                        }]
                    ,
                    processes:
                    {
                        process: [{
                            name: "One-Min-Daily-Candles-Volumes",
                            description: "Read trades files and generates one minute candles and volumes files for each day."
                        }]
                    },
                    directDependencies: [],
                    directDependents: [],
                    collaboratorsList: [],
                    github: {
                        org: "AAMasters",
                        repos: {
                            repo: [{
                                name: "AABruce",
                                description: "Produces two data-sets with candles and volumes for all markets at all exchanges.",
                                openIssues: 0,
                                openPullRequests: 0,
                                contributors: 1
                            }]
                        }
                    },
                    storage: {
                        sas: '?sv=2017-04-17&ss=f&srt=sco&sp=r&se=2018-12-31T19:28:33Z&st=2018-02-22T11:28:33Z&spr=https&sig=YaprSp9zO%2Fsz0nPPWwPMqPACxZTnYhSWKApfun%2Bfez4%3D',
                        fileUri: 'https://' + 'aatom' + '.file.core.windows.net'
                    }
                },
                {
                    codeName: "AAMariam",
                    displayName: "Mariam",
                    type: "Trading",
                    version: {
                        number: "1.0.0",
                        status: "Mantained", // Discontinued
                    },
                    products: [{
                        codeName: "Trading History",
                        displayName: "Mariam Trading History",
                        description: "General information about Mariam trading history.",
                        storageAccount: "aamariam",
                        filePath: "@Exchange/Mariam/dataSet.V1/Output/Trading-Process",
                        fileName: "Execution.History.json",
                        exchangeList: {
                            exchange: [{
                                name: "Poloniex",
                                datetimeRange: {
                                    minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                    maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                }
                            }]
                        },
                        layers:  [{
                            codeName: "Trading History",
                            displayName: "Mariam Trading History",
                            exchangeList: ["Poloniex"],
                            validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                            plotter: {
                                devTeam: "AAMasters",
                                repo: "AAMariam-Plotter",
                                moduleName: "History",
                                target: "Timeline"
                            }
                        }]
                        }, {
                            codeName: "Trading Details",
                            displayName: "Mariam Trading Details",
                            description: "Detailed information about Mariam execution.",
                            storageAccount: "aamariam",
                            filePath: "@Exchange/Mariam/dataSet.V1/Output/Trading-Process//@Year/@Month/@Day/@Hour/@Minute",
                            fileName: "Execution.Context.json",
                            exchangeList: {
                                exchange: [{
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }]
                            },
                            layers:  [{
                                codeName: "Trading Details",
                                displayName: "Mariam Trading Details",
                                exchangeList: ["Poloniex"],
                                validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                                plotter: {
                                    devTeam: "AAMasters",
                                    repo: "AAMariam-Plotter",
                                    moduleName: "Details",
                                    target: "Timeline"
                                }
                            }]
                        }]
                    ,
                    processes:
                    {
                        process: [{
                            name: "Trading-Process",
                            description: "Read trades files and generates one minute candles and volumes files for each day."
                        }]
                    },
                    directDependencies: [],
                    directDependents: [],
                    collaboratorsList: [],
                    github: {
                        org: "AAMasters",
                        repos: {
                            repo: [{
                                name: "AABruce",
                                description: "Produces two data-sets with candles and volumes for all markets at all exchanges.",
                                openIssues: 0,
                                openPullRequests: 0,
                                contributors: 1
                            }]
                        }
                    },
                    storage: {
                        sas: '?sv=2017-07-29&ss=f&srt=sco&sp=r&se=2018-12-30T23:44:52Z&st=2018-02-25T15:44:52Z&spr=https&sig=0pzOTcVAAOkgH7C4KmA1Rbs15kyjvVC1XFCsLQYjXKU%3D',
                        fileUri: 'https://' + 'aamariam' + '.file.core.windows.net'
                    }
                }
            ]
        }
        ]

    };

    return ecosystem;


    function initialize() {


    }


    function getTeam(pTeamCodeName) {

        for (let i = 0; i < ECOSYSTEM.devTeams.length; i++) {

            if (ECOSYSTEM.devTeams[i].codeName === pTeamCodeName) {

                return ECOSYSTEM.devTeams[i];
            }
        }
    }

    function getBot(pTeam, pBotCodeName) {

        for (let i = 0; i < pTeam.bots.length; i++) {

            if (pTeam.bots[i].codeName === pBotCodeName) {

                return pTeam.bots[i];
            }
        }
    }

    function getProduct(pBot, pProductCodeName) {

        for (let i = 0; i < pBot.products.length; i++) {

            if (pBot.products[i].codeName === pProductCodeName) {

                return pBot.products[i];
            }
        }
    }

    function getLayer(pProduct, pLayerCodeName) {

        for (let i = 0; i < pProduct.layers.length; i++) {

            if (pProduct.layers[i].codeName === pLayerCodeName) {

                return pProduct.layers[i];
            }
        }
    }

    function getExchange(pProduct, pName) {

        for (let i = 0; i < pProduct.exchangeList.exchange.length; i++) {

            if (pProduct.exchangeList.exchange[i].name === pName) {

                return pProduct.exchangeList.exchange[i];
            }
        }
    }

    function getLayers() {

        for (let i = 0; i < ecosystem.devTeams.length; i++) {


        }
    }
}

