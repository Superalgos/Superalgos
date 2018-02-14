


function newBotsLayersPanel() {

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
                        codeName : "AACharly",
                        displayName: "Charly",
                        type: "Extract",
                        version: {
                            number: "1.0.0",
                            status: "Mantained", // Discontinued
                        },
                        oputput: {
                            name: "Trades",
                            description: "Each file contains trades records of one market at one exchange in a period of time of one minute.",
                            storageAccount: "aacharly",
                            filePath: "@Exchange/Output/Trades/@Year/@Month/@Date/@Hour/@Minute",
                            fileName: "@AssetA_@AssetB.json",
                            datetimeRange: {
                                minDatetime: "2015-02-19 19:15:00.000 GMT+0000",
                                maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
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
                        oputput: {
                            name: "Order Books",
                            description: "Each file contains the bids and asks positions at each market at a certain moment in time.",
                            storageAccount: "aacarol",
                            filePath: "@Exchange/Output/Order-Books/@Year/@Month/@Date/@Hour/@Minute",
                            fileName: "@AssetA_@AssetB.json",
                            datetimeRange: {
                                minDatetime: "2017-02-19 19:15:00.000 GMT+0000",
                                maxDatetime: "2018-02-13 10:10:00.000 GMT+0000"
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
                            },
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

    const BUTTONS_STATES = {
        ON: 'on',
        INVISIBLE: 'invisible',
        OFF: 'off'
    };

    const LAYER_NAMES = {
        CANDLESTICKS: 'Candlesticks',
        VOLUME: 'Volume',
        ATH: 'All-time Highs and Lows',
        HIGH_LOWS: 'High and Lows',
        FORECAST: 'Forecast',
        ORDER_BOOKS: 'Order Books',
        CANDLE_STAIRS: 'Candle Stairs',
        VOLUME_STAIRS: 'Volume Stairs',
        BUY_SELL_BALANCE: 'Buy Sell Balance',
        LINEAR_REGRESION_CURVE: 'Linear Regression Curve'
    };

    var botsLayersPanel = {
        container: undefined,
        buttons: undefined,
        getLayerStatus: getLayerStatus,
        layerNames: LAYER_NAMES,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    container.isDraggeable = true;
    container.isZoomeable = false;
    botsLayersPanel.container = container;
    botsLayersPanel.container.frame.containerName = "Bots Layers Panel";

    let isInitialized = false;
    let buttons;

    return botsLayersPanel;




    function initialize() {

        this.container.frame.width = 200;
        this.container.frame.height = 270;

        var position = {
            x: viewPort.visibleArea.topLeft.x,
            y: viewPort.visibleArea.bottomRight.y - this.container.frame.height
        };

        this.container.frame.position = position;

        var buttonPosition;

        var buttonNames = [LAYER_NAMES.CANDLESTICKS, LAYER_NAMES.VOLUME, LAYER_NAMES.ATH, LAYER_NAMES.HIGH_LOWS, LAYER_NAMES.FORECAST, LAYER_NAMES.ORDER_BOOKS, LAYER_NAMES.CANDLE_STAIRS, LAYER_NAMES.VOLUME_STAIRS, LAYER_NAMES.BUY_SELL_BALANCE, LAYER_NAMES.LINEAR_REGRESION_CURVE];
        var lastY = 5;
        buttons = [];

        for (var i = 0; i < buttonNames.length; i++) {

            /* Buttons are going to be one at the right of the other. */

            var textButton = newTextButton();
            textButton.type = buttonNames[i];

            textButton.container.displacement.parentDisplacement = this.container.displacement;
            textButton.container.zoom.parentZoom = this.container.zoom;
            textButton.container.frame.parentFrame = this.container.frame;

            textButton.container.parentContainer = this.container;

            textButton.initialize();

            buttonPosition = {  // The first textButton 
                x: 10,
                y: botsLayersPanel.container.frame.height - botsLayersPanel.container.frame.getBodyHeight()
            };
            textButton.container.frame.position.x = buttonPosition.x;
            textButton.container.frame.position.y = buttonPosition.y + lastY;

            lastY = lastY + textButton.container.frame.height;

            /*  We start listening to the buttons click event, so as to know when one was pressed. */

            textButton.container.eventHandler.listenToEvent('onMouseClick', buttonPressed, i);

            let storedValue = window.localStorage.getItem(textButton.type);

            if (storedValue !== null) {

                textButton.status = storedValue;

            } else {

                textButton.status = BUTTONS_STATES.ON;

            }

            buttons.push(textButton);

            let eventData = {
                layer: textButton.type,
                status: textButton.status
            }

            botsLayersPanel.container.eventHandler.raiseEvent('Layer Status Changed', eventData);
        }

        botsLayersPanel.buttons = buttons;

        isInitialized = true;

    }


    function getLayerStatus(layerName) {

        for (let i = 0; i < buttons.length; i++) {

            let button = buttons[i];

            if (button.type === layerName) {

                return button.status;

            }

        }

        return BUTTONS_STATES.OFF;
    }


    function getContainer(point) {



        var container;

        /* First we check if this point is inside this space. */

        if (this.container.frame.isThisPointHere(point, true) === true) {

            /* Now we see which is the inner most container that has it */


            for (var i = 0; i < this.buttons.length; i++) {

                container = this.buttons[i].getContainer(point);

                if (container !== undefined) {

                    /* We found an inner container which has the point. We return it. */

                    return container;
                }
            }

            /* The point does not belong to any inner container, so we return the current container. */

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }




    function buttonPressed(event, buttonPressedIndex) {

        switch (botsLayersPanel.buttons[buttonPressedIndex].status) {

            case BUTTONS_STATES.ON:
                botsLayersPanel.buttons[buttonPressedIndex].status = BUTTONS_STATES.INVISIBLE;
                break;

            case BUTTONS_STATES.INVISIBLE:
                botsLayersPanel.buttons[buttonPressedIndex].status = BUTTONS_STATES.OFF;
                break;

            case BUTTONS_STATES.OFF:
                botsLayersPanel.buttons[buttonPressedIndex].status = BUTTONS_STATES.ON;
                break;

        }


        let eventData = {
            layer: botsLayersPanel.buttons[buttonPressedIndex].type,
            status: botsLayersPanel.buttons[buttonPressedIndex].status
        }

        botsLayersPanel.container.eventHandler.raiseEvent('Layer Status Changed', eventData);

        window.localStorage.setItem(botsLayersPanel.buttons[buttonPressedIndex].type, botsLayersPanel.buttons[buttonPressedIndex].status);

    }



    function draw() {

        if (isInitialized === false) { return; }

        botsLayersPanel.container.frame.draw(false, false, true);

        for (var i = 0; i < botsLayersPanel.buttons.length; i++) {
            botsLayersPanel.buttons[i].draw();
        }

    }





}