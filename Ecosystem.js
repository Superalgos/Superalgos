const ECOSYSTEM = {
    consortium: {
        organization: {
            name: "AAConsortium",
            type: "Non-For-Profit",
            displayName: "Advanced Algos Consortium",
            location: "Switzerland",
            leader: "Luis Molina",
            logo: "AAConsortium.jpg"
        },
        web: "www.AdvancedAlgos.org",
        github: {
            org: "Advanced Algos",
            repos: {
                repo: {
                    name: "AABrowser",
                    openIssues: 0,
                    openPullRequests: 0,
                    contributors: 1
                }
            }
        },
        members: {
            member: {
                organizationName: "AAMasters",
                type: "devTeam",
                delegate: "Luis Molina",
                votes: 1
            },
            member: {
                organizationName: "AAOrion LLC",
                type: "cloudHosting",
                delegate: "Luis Molina",
                votes: 5
            },
            member: {
                organizationName: "AAExchange Masters",
                type: "exchangeWrapper",
                delegate: "Luis Molina",
                votes: 1
            }
        }
    },
    devTeams: {
        team: {
            organization: {
                name: "AAMasters",
                type: "Open Source Community",
                displayName: "AA Masters",
                location: "Global",
                leader: "Luis Molina",
                logo: "AAMasters.jpg"
            },
            teamMembers: {
                member: {
                    displayName: "Luis Molina",
                    githubUsername: "Luis-Fernando-Molina",
                    profilePicture: "Luis.jpg",
                    tokens: {
                        percentDistribution: 100,
                        totalCollected: 121.45
                    }
                }
            },
            bots: {
                bot: {
                    codeName: "AACharly",
                    displayName: "Charly",
                    type: "Extract",
                    version: {
                        number: "1.0.0",
                        status: "Mantained", // Discontinued
                    },
                    products: {
                        product: {
                            name: "Trades",
                            description: "Each file contains trades records of one market at one exchange in a period of time of one minute.",
                            storageAccount: "aacharly",
                            filePath: "@Exchange/Output/Trades/@Year/@Month/@Date/@Hour/@Minute",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: {
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }
                            },
                            layers: {
                                layer: {
                                    displayName: "Trades",
                                    exchangeList: ["Poloniex"],
                                    validPeriods: ["01-min"],
                                    renderer: {
                                        devTeam: "AAMasters",
                                        bot: "AACharly",
                                        moduleName: "TradeList",
                                        target: "Timeline"
                                    }
                                }
                            }
                        }
                    },
                    processes: {
                        process: {
                            name: "Poloniex-Live-Trades",
                            description: "Retrieves the trades done at the current minute and the previous minute and saves them at the storage account."
                        },
                        process: {
                            name: "Poloniex-Historic-Trades",
                            description: "Retrieves and saves the historical trades in batches going backwards from the current time until reaching the begining of the market."
                        },
                        process: {
                            name: "Poloniex-Hole-Fixing",
                            description: "Scans the trades saved by the Live Trades and Historic Trades processes searching for missing records. Once a hole is found on the data set, it patches it by retrieving the missing records from the exchange."
                        }
                    },
                    directDependencies: {},
                    directDependents: {
                        bot: {
                            devTeam: "AAMasters",
                            codeName: "AABruce"
                        },
                        bot: {
                            devTeam: "AAMasters",
                            codeName: "AAOlivia"
                        }
                    },
                    collaboratorsList: [],
                    github: {
                        org: "AAMasters",
                        repos: {
                            repo: {
                                name: "AACharly",
                                openIssues: 0,
                                openPullRequests: 0,
                                contributors: 1
                            }
                        }
                    }
                },
                bot: {
                    codeName: "AACarol",
                    displayName: "Carol",
                    type: "Extract",
                    version: {
                        number: "1.0.0",
                        status: "Mantained", // Discontinued
                    },
                    products: {
                        product: {
                            name: "Order Book",
                            description: "Each file contains the bids and asks positions at each market at a certain moment in time.",
                            storageAccount: "aacarol",
                            filePath: "@Exchange/Output/Order-Books/@Year/@Month/@Date/@Hour/@Minute",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: {
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }
                            },
                            layers: {
                                layer: {
                                    displayName: "Order Book",
                                    exchangeList: ["Poloniex"],
                                    validPeriods: ["06-hs", "03-hs", "01-hs", "30-min", "10-min", "05-min", "01-min"],
                                    renderer: {
                                        devTeam: "AAMasters",
                                        bot: "AACarol",
                                        moduleName: "OrderBook",
                                        target: "Panel"
                                    }
                                }
                            }
                        },
                        product: {
                            name: "Order Books",
                            description: "Each file contains the sumarized bids and asks positions at each market at a certain moment in time. Agreggation makes the dataset optimal for different time periods.",
                            storageAccount: "aacarol",
                            filePath: "@Exchange/Output/Aggregated-Order-Books/@Period/@Year/@Month/@Date/@Hour/@Minute",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: {
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }
                            },
                            layers: {
                                layer: {
                                    displayName: "Order Books",
                                    exchangeList: ["Poloniex"],
                                    validPeriods: ["06-hs", "03-hs", "01-hs", "30-min", "10-min", "05-min", "01-min"],
                                    renderer: {
                                        devTeam: "AAMasters",
                                        bot: "AACarol",
                                        moduleName: "OrderBooks",
                                        target: "Timeline"
                                    }
                                }
                            }
                        }
                    },
                    processes: {
                        process: {
                            name: "Poloniex-Order-Books",
                            description: "Retrieves the order books at the current minute and saves them at the storage account."
                        },
                        process: {
                            name: "Aggregated-Order-Books",
                            description: "Aggregates the order books information to be viewed at different time periods."
                        },
                    },
                    directDependencies: {},
                    directDependents: {},
                    collaboratorsList: [],
                    github: {
                        org: "AAMasters",
                        repos: {
                            repo: {
                                name: "AACarol",
                                openIssues: 0,
                                openPullRequests: 0,
                                contributors: 1
                            }
                        }
                    }
                },
                bot: {
                    codeName: "AABruce",
                    displayName: "Bruce",
                    type: "Indicator",
                    version: {
                        number: "1.0.0",
                        status: "Mantained", // Discontinued
                    },
                    products: {
                        product: {
                            name: "One Minute Candles in Daily Files",
                            description: "Each file contains the candles of one whole day on a one minute time period.",
                            storageAccount: "aabruce",
                            filePath: "@Exchange/Output/Candles/One-Min/@Year/@Month/@Date",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: {
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }
                            },
                            layers: {
                                layer: {
                                    displayName: "Candlesticks",
                                    exchangeList: ["Poloniex"],
                                    validPeriods: ["30-min", "10-min", "05-min", "01-min"],
                                    renderer: {
                                        devTeam: "AAMasters",
                                        bot: "AABruce",
                                        moduleName: "Candlesticks",
                                        target: "Timeline"
                                    }
                                }
                            }
                        },
                        product: {
                            name: "One Minute Volumes in Daily Files",
                            description: "Each file contains the volumes of one whole day on a one minute time period.",
                            storageAccount: "aabruce",
                            filePath: "@Exchange/Output/Volumes/One-Min/@Year/@Month/@Date",
                            fileName: "@AssetA_@AssetB.json",
                            exchangeList: {
                                exchange: {
                                    name: "Poloniex",
                                    datetimeRange: {
                                        minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                        maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
                                    }
                                }
                            },
                            layers: {
                                layer: {
                                    displayName: "Sell and Buy Volumes",
                                    exchangeList: ["Poloniex"],
                                    validPeriods: ["06-hs", "03-hs", "01-hs", "30-min", "10-min", "05-min", "01-min"],
                                    renderer: {
                                        devTeam: "AAMasters",
                                        bot: "AABruce",
                                        moduleName: "Volumes",
                                        target: "Timeline"
                                    }
                                }
                            }
                        }
                    },
                    processes: {
                        process: {
                            name: "One-Min-Daily-Candles-Volumes",
                            description: "Read trades files and generates one minute candles and volumes files for each day."
                        }
                    },
                    directDependencies: {},
                    directDependents: {},
                    collaboratorsList: [],
                    github: {
                        org: "AAMasters",
                        repos: {
                            repo: {
                                name: "AACarol",
                                openIssues: 0,
                                openPullRequests: 0,
                                contributors: 1
                            }
                        }
                    }
                }
            }
        }
    },
    clouds: {
        cloudHosting: {
            codeName: "AAOrion",
            organization: {
                name: "AAOrion LLC",
                type: "Company",
                displayName: "Orion",
                location: "USA",
                leader: "Luis Molina",
                logo: "AAOrion.jpg"
            },
            github: {
                org: "AAOrion",
                repos: {
                    repo: {
                        name: "AzureAAHosting",
                        description: "AA Azure Hosting Web Site",
                        openIssues: 0,
                        openPullRequests: 0,
                        contributors: 1
                    }
                }
            },
            underlayingCloud: "Azure",
            botsRunning: {
                bot: {
                    devTeam: "AAMasters",
                    codeName: "AACharly",
                    version: "1.0.0",
                    status: "Alive",
                    stats: {
                        tokens: {
                            totalCollected: 532.2442,
                            totalSpent: 323.455,
                            currentBalance: 142,
                            expensesPerHour: 1.44,
                            maxBalance: 177,
                            minBalance: 22.44
                        },
                        life: {
                            born: "2015-02-19 19:15:00.000 GMT+0000",
                            died: undefined,
                            expectedToRetire: "2019-02-19 19:15:00.000 GMT+0000",
                            expectedToDie: "2019-03-19 19:15:00.000 GMT+0000"
                        }
                    }
                },
                bot: {
                    devTeam: "AAMasters",
                    codeName: "AACarol",
                    version: "1.0.0",
                    status: "Alive",
                    stats: {
                        tokens: {
                            totalCollected: 532.2442,
                            totalSpent: 323.455,
                            currentBalance: 142,
                            expensesPerHour: 1.44,
                            maxBalance: 177,
                            minBalance: 22.44
                        },
                        life: {
                            born: "2015-02-19 19:15:00.000 GMT+0000",
                            died: undefined,
                            expectedToRetire: "2019-02-19 19:15:00.000 GMT+0000",
                            expectedToDie: "2019-03-19 19:15:00.000 GMT+0000"
                        }
                    }
                }
            },
            stats: {
                extractionBots: 2,
                indicatorsBots: 24,
                tradingBots: 12,
                suscribers: 230,
                apps: 1
            }
        }
    },
    exchanges: {
        exchangeWrapper: {
            codeName: "AAExchange-Masters",
            organization: {
                name: "AAExchange Masters",
                type: "Open Source Project",
                displayName: "Exchange Masters",
                location: "Global",
                leader: "Luis Molina",
                logo: "AAExchange-Masters.jpg"
            },
            exchangesServed: {
                exchange: {
                    name: "Poloniex",
                    github: {
                        org: "AAExchange Masters",
                        repo: {
                            name: "AAPoloniexWrapper",
                            description: "Wrapps Poloniex Exchange to be acceced from within the Advanced Algos Ecosystem.",
                            openIssues: 0,
                            openPullRequests: 0,
                            contributors: 1
                        }
                    }
                },
                exchange: {
                    name: "Binance",
                    github: {
                        org: "AAExchange Masters",
                        repo: {
                            name: "AABinanceWrapper",
                            description: "Wrapps Binance Exchange to be acceced from within the Advanced Algos Ecosystem.",
                            openIssues: 0,
                            openPullRequests: 0,
                            contributors: 1
                        }
                    }
                }
            }
        }
    },
    apps: {
        app: {
            organization: {
                name: "AAApps Masters",
                type: "Open Source Project",
                displayName: "Global Ranking",
                location: "Global",
                leader: "Luis Molina",
                logo: "AAApps-Masters.jpg"
            },
            github: {
                org: "AAApps Masters",
                repo: {
                    name: "AAGlobalRanking",
                    description: "Global Ranking Web Site",
                    openIssues: 0,
                    openPullRequests: 0,
                    contributors: 1
                }
            },
            web: "www.AAGlobalRanking.org",
            tradingBots: {
                bot: {
                    devTeam: "AAMasters",
                    codeName: "AAMichael",
                    version: "1.0.0",
                    cloudHosting: "AAOrion",
                    suscribers: {
                        subscriber: {
                            userName: "Trader 007",
                            subscription: {
                                type: "Trade-For-Me",
                                tokensPaid: 20,
                                expirationDatetime: "2019-03-19 19:15:00.000 GMT+0000"
                            }
                        },
                        subscriber: {
                            userName: "EliasYofre1",
                            subscription: {
                                type: "Buy-Sell-Signals",
                                tokensPaid: 1,
                                expirationDatetime: "2019-03-19 19:15:00.000 GMT+0000"
                            }
                        }
                    }
                }
            }
        }
    }
};
