exports.newGovernanceData = function newGovernanceData() {
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        sendGovernanceData: sendGovernanceData
    };

    let socketClient;
    let WEB_SOCKET;
    let userProfilesById;
    let pools;

    return thisObject;

    function initialize(pSocketClient, pWEB_SOCKET, pUserProfilesById, pPools) {
        socketClient = pSocketClient;
        WEB_SOCKET = pWEB_SOCKET;
        userProfilesById = pUserProfilesById;
        pools = pPools;
        
    }

    function finalize() {
        
    }

    function sendGovernanceData() {
        try {
            SA.logger.debug(`[GovernanceData] USER_PROFILES_BY_ID Size: ${userProfilesById ? userProfilesById.size : 'Undefined'}`);
    
            if (!userProfilesById || userProfilesById.size === 0) {
                //SA.logger.warn('[WARN] USER_PROFILES_BY_ID is undefined or empty.');
                return;
            }
    
            // Convertir el mapa a un array para procesamiento
            let userProfilesArray = Array.from(userProfilesById.values());
    
            //SA.logger.info(`[GovernanceData] Processing ${userProfilesArray.length} user profiles.`);
    
            // Preparar los datos de gobernanza
            let governanceData = userProfilesArray.map(userProfile => {
                // Obtener Own Power del balance del usuario
                let ownPower = userProfile.balance || -1; // balance y blockchainPower son lo mismo
    
                // Calcular totalTokenPower sumando el tokenPower de todos los programas
                let programsTokenPower = getProgramsTokenPower(userProfile);
                let totalTokenPower = userProfile.payload?.tokenPower || -1; // Asegurarse de que payload existe y tokenPower está definido
    
                // Calcular incomingPower
                let incomingPower = totalTokenPower - ownPower;
    
                // Evitar valores negativos
                if (incomingPower < 0) {
                    incomingPower = 0;
                }
    
                // Obtener los tokens otorgados (Awarded) y bonus
                let tokensMined = getTokensMined(userProfile);
    
                // Log de los datos antes de enviar
                SA.logger.debug(`[GovernanceData] Profile: ${userProfile.name}, TokenPower: ${totalTokenPower}, Programs: ${JSON.stringify(programsTokenPower)}`);
    
                return {
                    profileId: userProfile.id,
                    name: userProfile.name,
                    blockchainPower: ownPower, // Poder propio del usuario
                    incomingPower: incomingPower, // Poder delegado al usuario
                    tokenPower: totalTokenPower, // Total Token Power
                    awarded: tokensMined.awarded, // Tokens otorgados totales
                    bonus: tokensMined.bonus, // Bonus tokens
                    tokensMined: tokensMined.total, // Total tokens mined
                    balance: ownPower, // Balance total acumulado (mismo que blockchainPower)
                    balancesByChain: {
                        balanceBNB: userProfile.balancesByChain?.['BSC'] || 0,
                        balanceETH: userProfile.balancesByChain?.['ETH'] || 0,
                        balanceZKS: userProfile.balancesByChain?.['ZKS'] || 0
                    },
                    programsTokenPower: programsTokenPower // Distribución de tokenPower por programa
                };
            });
    
            // También podemos incluir información de los pools
            let poolsData = getPoolsData();
    
            // Preparar el mensaje para enviar, incluyendo los pools
            let messagePayload = {
                governanceData: governanceData,
                poolsData: poolsData
            };
    
            let messageToSend = `${new Date().toISOString()}|*|Platform|*|Data|*|GovernanceData|*|${JSON.stringify(messagePayload)}`;
    
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                socketClient.send(messageToSend);
                //SA.logger.info('[GovernanceData] Governance Data sent successfully.', governanceData);
            } else {
                SA.logger.warn('[WARN] WebSocket is not open. Could not send Governance data.');
            }
        } catch (err) {
            SA.logger.error('[ERROR] Error sending Governance data:', err);
        }
    }
    

    function getTokensMined(userProfile) {
        let awarded = 0;
        let bonus = 0;
        let total = 0;
    
        // Asegurar que 'tokensMined', 'payload', y 'tokensMined' existen
        if (!userProfile.tokensMined) {
            userProfile.tokensMined = {};
            SA.logger.debug(`[getTokensMined] Initialized tokensMined for userProfile: ${userProfile.name}`);
        }
        if (!userProfile.tokensMined.payload) {
            userProfile.tokensMined.payload = {};
            SA.logger.debug(`[getTokensMined] Initialized tokensMined.payload for userProfile: ${userProfile.name}`);
        }
        if (!userProfile.tokensMined.payload.tokensMined) {
            userProfile.tokensMined.payload.tokensMined = {
                awarded: 0,
                bonus: 0,
                total: 0
            };
            SA.logger.debug(`[getTokensMined] Initialized tokensMined.payload.tokensMined for userProfile: ${userProfile.name}`);
        }
    
        // Asignar valores si existen
        if (userProfile.tokensMined.payload.tokensMined) {
            awarded = userProfile.tokensMined.payload.tokensMined.awarded || 0;
            bonus = userProfile.tokensMined.payload.tokensMined.bonus || 0;
            total = userProfile.tokensMined.payload.tokensMined.total || 0;
        }
    
        // Log de los valores obtenidos
        SA.logger.debug(`[getTokensMined] Retrieved tokensMined for userProfile: ${userProfile.name} - Awarded: ${awarded}, Bonus: ${bonus}, Total: ${total}`);
    
        return {
            awarded: awarded,
            bonus: bonus,
            total: total
        };
    }
    

    function getProgramsTokenPower(userProfile) {
        let programsTokenPower = [];

        function traverseNode(node) {
            if (node === undefined) { return; }
            if (node.payload === undefined) { node.payload = {}; }

            // Si el nodo es un programa, extraemos su tokenPower y otros datos
            if (
                node.type === 'Referral Program' ||
                node.type === 'Mentorship Program' ||
                node.type === 'Support Program' ||
                node.type === 'Influencer Program' ||
                node.type === 'Voting Program' ||
                node.type === 'Claims Program' ||
                node.type === 'Staking Program' ||
                node.type === 'Delegation Program' ||
                node.type === 'Github Program' ||
                node.type === 'Airdrop Program' ||
                node.type === 'Followed Bot Reference' ||
                node.type === 'Task Server App'
            ) {
                programsTokenPower.push({
                    programName: node.name,
                    programType: node.type,
                    tokenPower: node.payload.tokenPower || 0,
                    awardedTokens: node.payload.awarded?.tokens || 0,
                    bonusTokens: node.payload.bonus?.tokens || 0,
                    // Agrega más campos si es necesario
                });
                return; // No continuamos más allá de los programas
            }

            // Recorremos los nodos hijos
            let schemaDocument = getSchemaDocument(node);
            if (schemaDocument === undefined) { return; }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i];

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name];
                            traverseNode(childNode);
                            break;
                        }
                        case 'array': {
                            let propertyArray = node[property.name];
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m];
                                    traverseNode(childNode);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        traverseNode(userProfile);

        return programsTokenPower;
    }

    function getPoolsData() {
        if (!pools) {
            //SA.logger.warn('[GovernanceData] Pools data is undefined.');
            return [];
        }

        let poolsData = [];

        function traversePool(node) {
            if (node === undefined) { return; }
            if (node.payload === undefined) { node.payload = {}; }

            if (node.type === 'Pool') {
                poolsData.push({
                    poolName: node.name,
                    codeName: node.config?.codeName || '',
                    tokens: node.payload.tokens || 0,
                    weight: node.payload.weight || 0,
                    weightPower: node.payload.weightPower || 0,
                    // Agrega más campos si es necesario
                });
            }

            // Recorremos los nodos hijos
            let schemaDocument = getSchemaDocument(node);
            if (schemaDocument === undefined) { return; }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i];

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name];
                            traversePool(childNode);
                            break;
                        }
                        case 'array': {
                            let propertyArray = node[property.name];
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m];
                                    traversePool(childNode);
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        for (let i = 0; i < pools.length; i++) {
            traversePool(pools[i]);
        }

        return poolsData;
    }

    function getSchemaDocument(node) {
        if (node.project === undefined || node.type === undefined) { return; }
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type);
        return schemaDocument;
    }
};
