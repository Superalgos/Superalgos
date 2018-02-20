
function newEcosystem() {

    let ecosystem = {
        getTeam: getTeam,
        getBot: getBot,
        getProduct: getProduct,
        getLayer: getLayer,
        getExchange: getExchange, 
        initialize: initialize
    }
 
    const ECOSYSTEM = {
        devTeams:
        {
            team: [{
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
                {
                    bot: [
                        {
                            codeName: "AAOlivia",
                            displayName: "Olivia",
                            type: "Indicator",
                            version: {
                                number: "1.0.0",
                                status: "Mantained", // Discontinued
                            },
                            products: {
                                product: [{
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
                                    layers: {
                                        layer: [{
                                            codeName: "Market Candlesticks",
                                            displayName: "Candlesticks",
                                            exchangeList: ["Poloniex"],
                                            validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                                            plotter: {
                                                devTeam: "AAMasters",
                                                repo: "AAOlivia-Plotter",
                                                moduleName: "Candlesticks",
                                                target: "Timeline",
                                                dependencies: {
                                                    dependency: {
                                                        devTeam: "AAMasters",
                                                        repo: "Plotters-Utilities",
                                                        moduleName: "Candlesticks"
                                                    }
                                                }
                                            }
                                        }]
                                    }
                                }, {
                                    codeName: "Market Volumes",
                                    displayName: "Market Volumes per Period",
                                    description: "A set of files per period that contains all volumes of one whole market.",
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
                                    layers: {
                                        layer: [{
                                            codeName: "Market Volumes",
                                            displayName: "Volumes",
                                            exchangeList: ["Poloniex"],
                                            validPeriods: ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs"],
                                            plotter: {
                                                devTeam: "AAMasters",
                                                repo: "AAOlivia-Plotter",
                                                moduleName: "Volumes",
                                                target: "Timeline",
                                                dependencies: {
                                                    dependency: {
                                                        devTeam: "AAMasters",
                                                        repo: "Plotters-Utilities",
                                                        moduleName: "Volumes"
                                                    }
                                                }
                                            }
                                        }]
                                    }
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
                                        layers: {
                                            layer: [{
                                                codeName: "Daily Candlesticks",
                                                displayName: "Candlesticks",
                                                exchangeList: ["Poloniex"],
                                                validPeriods: ["45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"],
                                                plotter: {
                                                    devTeam: "AAMasters",
                                                    repo: "AAOlivia-Plotter",
                                                    moduleName: "Candlesticks",
                                                    target: "Timeline",
                                                    dependencies: {
                                                        dependency: {
                                                            devTeam: "AAMasters",
                                                            repo: "Plotters-Utilities",
                                                            moduleName: "Candlesticks"
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }, {
                                        codeName: "Daily Volumes",
                                        displayName: "Daily Volumes per Period",
                                        description: "A set of files per period that contains all volumes of one whole market.",
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
                                        layers: {
                                            layer: [{
                                                codeName: "Daily Volumes",
                                                displayName: "Volumes",
                                                exchangeList: ["Poloniex"],
                                                validPeriods: ["45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"],
                                                plotter: {
                                                    devTeam: "AAMasters",
                                                    repo: "AAOlivia-Plotter",
                                                    moduleName: "Volumes",
                                                    target: "Timeline",
                                                    dependencies: {
                                                        dependency: {
                                                            devTeam: "AAMasters",
                                                            repo: "Plotters-Utilities",
                                                            moduleName: "Volumes"
                                                        }
                                                    }
                                                }
                                            }]
                                        }
                                    }]
                            },
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
                        }
                    ]
                }
            }]
        }
    };

    return ecosystem;


    function initialize() {


    }


    function getTeam(pTeamCodeName) {

        for (let i = 0; i < ECOSYSTEM.devTeams.team.length; i++) {

            if (ECOSYSTEM.devTeams.team[i].codeName === pTeamCodeName) {

                return ECOSYSTEM.devTeams.team[i];
            }
        }
    }

    function getBot(pTeam, pBotCodeName) {

        for (let i = 0; i < pTeam.bots.bot.length; i++) {

            if (pTeam.bots.bot[i].codeName === pBotCodeName) {

                return pTeam.bots.bot[i];
            }
        }
    }

    function getProduct(pBot, pProductCodeName) {

        for (let i = 0; i < pBot.products.product.length; i++) {

            if (pBot.products.product[i].codeName === pProductCodeName) {

                return pBot.products.product[i];
            }
        }
    }

    function getLayer(pProduct, pLayerCodeName) {

        for (let i = 0; i < pProduct.layers.layer.length; i++) {

            if (pProduct.layers.layer[i].codeName === pLayerCodeName) {

                return pProduct.layers.layer[i];
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

}

