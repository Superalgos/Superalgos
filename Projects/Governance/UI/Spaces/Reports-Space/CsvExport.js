/**
 * @typedef CsvExportFunction
 * @property {() => CsvResponse} asCsv
 * @property {() => void} initialize
 * @property {() => void} finalize
 */

/**
 * 
 * @returns {CsvExportFunction}
 */
function newGovernanceReportsCsvExport() {
    let thisObject = {
        asCsv: asCsv,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    /**
     * Generates the CSV data export
     * 
     * @returns {CsvResponse}
     */
    function asCsv(userProfiles) {
        const response = commonRecordsAsCsv()
        response.userProfiles = tableRecordsAsCsv(userProfiles)
        return response
    }

    /**
     * @returns {CsvResponse}
     */
    function commonRecordsAsCsv() {
        let commonRecordDefinition = {
            headers: [
                {
                    name: "name",
                    label: "Name",
                },
                {
                    name: "tokensReward",
                    label: "Tokens Reward",
                },
                {
                    name: "rewardsInBTC",
                    label: "Rewards In BTC",
                },
                {
                    name: "weight",
                    label: "Weight",
                },
                {
                    name: "weightPower",
                    label: "Weight Power",
                },
            ],
            properties: [
                {
                    programName: 'Asset',
                    programPropertyName: 'Assets',
                    exec: addCommonNodeProperties
                },
                {
                    programName: 'Feature',
                    programPropertyName: 'Features',
                    exec: addCommonNodeProperties
                },
                {
                    programName: 'Pool',
                    programPropertyName: 'Pools',
                    exec: addCommonNodeProperties
                },
                {
                    programName: 'Position',
                    programPropertyName: 'Positions',
                    exec: addCommonNodeProperties
                },
            ]
        }

        /** @type {CommonRecordMap} */ 
        const commonRecordMap = {
            assets: [],
            features: [],
            pools: [],
            positions: [],
        }

        for (let pIdx = 0; pIdx < commonRecordDefinition.properties.length; pIdx++) {
            const prop = commonRecordDefinition.properties[pIdx]
            prop.exec(prop, commonRecordMap)
        }

        return {
            assets: recordsToRows(recordsAsSortedList(commonRecordMap.assets), commonRecordDefinition.headers),
            features: recordsToRows(recordsAsSortedList(commonRecordMap.features), commonRecordDefinition.headers),
            pools: recordsToRows(recordsAsSortedList(commonRecordMap.pools), commonRecordDefinition.headers),
            positions: recordsToRows(recordsAsSortedList(commonRecordMap.positions), commonRecordDefinition.headers),
        }

        /**
         * 
         * @param {CommonRecord[]} records 
         * @returns {[string,RecordValue][][]}
         */
        function recordsAsSortedList(records) {
            const list = []
            for(let i = 0; i < records.length; i++) {
                let innerList = []
                for (const [key, value] of Object.entries(records[i])) {
                    innerList.push([key,value])
                }
                innerList.sort((a, b) => a[1].order - b[1].order)
                list.push(innerList)
            }
            return list
        }

        /**
         * 
         * @param {TablePropertyDefinition} prop
         * @param {CommonRecordMap} commonRecordMap 
         */
        function addCommonNodeProperties(prop, commonRecordMap) {
            const recordKey = prop.programPropertyName.toLowerCase()
            // TODO: recreate this function in the export governance app file
            let nodes = UI.projects.workspaces.spaces.designSpace.workspace.getNodesByTypeAndHierarchyHeadsType(prop.programName, prop.programPropertyName)
            for (let j = 0; j < nodes.length; j++) {
                let node = nodes[j]
    
                let weightPower
                if (node.payload.votingProgram !== undefined) { 
                    weightPower = node.payload.votingProgram.votes
                 } else {
                    weightPower = 0
                 }
    
                /*
                Display node name and path
                */
                let name = node.name
                let nodePath = []
                if (node.payload.parentNode !== undefined) {
                    if (node.payload.parentNode.payload.parentNode !== undefined) {
                        if (node.payload.parentNode.payload.parentNode.payload.parentNode !== undefined) {
                            if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode !== undefined) {
                                nodePath.push(node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.name)
                            }
                            nodePath.push(node.payload.parentNode.payload.parentNode.payload.parentNode.name)
                        }
                        nodePath.push(node.payload.parentNode.payload.parentNode.name)
                    }
                    nodePath.push(node.payload.parentNode.name)
                }
                if (nodePath.length) {
                    name = name + ' ('
                    for (let i = 0; i < nodePath.length; i++) {
                        name = name + nodePath[i]
                        if (i < (nodePath.length - 1)) { name = name + ' - ' }
                    }
                    name = name + ')'   
                }
                const record = newCommonRecord()
                record.name.value = name
                record.tokensReward.value = node.payload.tokens | 0,
                record.rewardsInBTC.value = UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload.tokens | 0),
                record.weight.value = (node.payload.weight * 100).toFixed(2) + '%',
                record.weightPower.value = weightPower
                commonRecordMap[recordKey].push(record)
            }
        }

        /**
         * 
         * @returns {CommonRecord}
         */
        function newCommonRecord() {
            return {
                name: {value: '', order: 1 },
                tokensReward: {value: 0, order: 2 },
                rewardsInBTC: {value: 0, order: 3 },
                weight: {value: 0, order: 4 },
                weightPower: {value: 0, order: 5 },
            }
        }
    }
    
    function tableRecordsAsCsv(userProfiles) {
        let tableRecords = []
        let tableRecordDefinition = {
            headers: [
                {
                    name: "name",
                    label: "User Profile",
                },
                {
                    name: "blockchainPower",
                    label: "Blockchain Power",
                },
                {
                    name: "delegatedPower",
                    label: "Delegated Power",
                },
                {
                    name: "tokenPower",
                    label: "Token Power",
                },
                {
                    name: "airdropPower",
                    label: "Airdrop Power",
                },
                {
                    name: "airdropTokensAwarded",
                    label: "Airdrop Tokens Awarded",
                },
                {
                    name: "claimPower",
                    label: "Claim Power",
                },
                {
                    name: "claimTokensAwarded",
                    label: "Claim Tokens Awarded",
                },
                {
                    name: "computingPower",
                    label: "Computing Power",
                },
                {
                    name: "computingPercentage",
                    label: "Computing Percentage",
                },
                {
                    name: "computingTokensAwarded",
                    label: "Computing Tokens Awarded",
                },
                {
                    name: "delegationPower",
                    label: "Delegation Power",
                },
                {
                    name: "delegationTokensBonus",
                    label: "Delegation Tokens Bonus",
                },
                {
                    name: "githubForks",
                    label: "Github Forks",
                },
                {
                    name: "githubPower",
                    label: "Github Power",
                },
                {
                    name: "githubStars",
                    label: "Github Stars",
                },
                {
                    name: "githubTokensAwarded",
                    label: "Github Tokens Awarded",
                },
                {
                    name: "githubWatching",
                    label: "Github Watching",
                },
                {
                    name: "miningBlockchainAccount",
                    label: "Mining Blockchain Account",
                },
                {
                    name: "miningMinedInBTC",
                    label: "Mining Mined In BTC",
                },
                {
                    name: "miningTokensAwarded",
                    label: "Mining Tokens Awarded",
                },
                {
                    name: "miningTokensBonus",
                    label: "Mining Tokens Bonus",
                },
                {
                    name: "miningTokensMined",
                    label: "Mining Tokens Mined",
                },
                {
                    name: "stakingPower",
                    label: "Staking Power",
                },
                {
                    name: "stakingTokensAwarded",
                    label: "Staking Tokens Awarded",
                },
                {
                    name: "votingIncoming",
                    label: "Voting Incoming",
                },
                {
                    name: "votingOwnPower",
                    label: "Voting Own Power",
                },
                {
                    name: "votingPower",
                    label: "Voting Power",
                },
                {
                    name: "votingReputation",
                    label: "Voting Reputation",
                },
                {
                    name: "votingTokensBonus",
                    label: "Voting Tokens Bonus",
                },
                {
                    name: "liquidityMarket",
                    label: "Liquidity Market",
                },
                {
                    name: "liquidityExchange",
                    label: "Liquidity Exchange",
                },
                {
                    name: "liquidityPercentage",
                    label: "Liquidity Percentage",
                },
                {
                    name: "liquidityPower",
                    label: "Liquidity Power",
                },
                {
                    name: "liquidityTokensAwarded",
                    label: "Liquidity Tokens Awarded",
                },
                {
                    name: "referralOwnPower",
                    label: "Referral Own Power",
                },
                {
                    name: "referralIncoming",
                    label: "Referral Incoming",
                },
                {
                    name: "referralTokensAwarded",
                    label: "Referral Tokens Awarded",
                },
                {
                    name: "referralDecendants",
                    label: "Referral Decendants",
                },
                {
                    name: "referralTokensBonus",
                    label: "Referral Token Bonus",
                },
                {
                    name: "influencersOwnPower",
                    label: "Influencers Own Power",
                },
                {
                    name: "influencersIncoming",
                    label: "Influencers Incoming",
                },
                {
                    name: "influencersTokensAwarded",
                    label: "Influencers Tokens Awarded",
                },
                {
                    name: "influencersDecendants",
                    label: "Influencers Decendants",
                },
                {
                    name: "influencersTokensBonus",
                    label: "Influencers Token Bonus",
                },
                {
                    name: "mentorsOwnPower",
                    label: "Mentors Own Power",
                },
                {
                    name: "mentorsIncoming",
                    label: "Mentors Incoming",
                },
                {
                    name: "mentorsTokensAwarded",
                    label: "Mentors Tokens Awarded",
                },
                {
                    name: "mentorsDecendants",
                    label: "Mentors Decendants",
                },
                {
                    name: "mentorsTokensBonus",
                    label: "Mentors Token Bonus",
                },
                {
                    name: "supportsOwnPower",
                    label: "Supports Own Power",
                },
                {
                    name: "supportsIncoming",
                    label: "Supports Incoming",
                },
                {
                    name: "supportsTokensAwarded",
                    label: "Supports Tokens Awarded",
                },
                {
                    name: "supportsDecendants",
                    label: "Supports Decendants",
                },
                {
                    name: "supportsTokensBonus",
                    label: "Supports Token Bonus",
                },
            ],
            properties: [
                {
                    programName: 'Airdrop Program',
                    programPropertyName: 'airdropProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.airdropPower.value = payload.ownPower | 0
                        record.airdropTokensAwarded.value = payload.awarded.tokens | 0
                    },
                    exec: addPropertyTokens
                },
                {
                    programName: 'Claims Program',
                    programPropertyName: 'claimsProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.claimPower.value = payload.ownPower | 0
                        record.claimTokensAwarded.value = payload.awarded.tokens | 0
                    },
                    exec: addPropertyTokens
                },
                {
                    programName: 'Computing Program',
                    programPropertyName: 'computingProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.computingPower.value = payload.ownPower | 0
                        record.computingPercentage.value = payload.awarded.percentage / 100 | 0
                        record.computingTokensAwarded.value = payload.awarded.tokens | 0
                    },
                    exec: addPropertyTokens
                },
                {
                    programName: 'Delegation Program',
                    programPropertyName: 'delegationProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.delegationPower.value = payload.ownPower | 0
                        record.delegationTokensBonus.value = payload.bonus.tokens | 0
                    },
                    exec: addPropertyTokensWithBonus
                },
                {
                    programName: 'Github Program',
                    programPropertyName: 'githubProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.githubPower.value = payload.ownPower | 0
                        record.githubStars.value = payload.starsCount | 0,
                        record.githubWatching.value = payload.watchersCount | 0
                        record.githubForks.value = payload.forksCount | 0
                        record.githubTokensAwarded.value = payload.awarded.tokens | 0
                    },
                    exec: addPropertyTokens
                },
                {
                    programName: 'liquidity Program',
                    programPropertyName: 'liquidityProgram',
                    exec: addLiquidityTokens
                },
                {
                    programName: 'Mining Program',
                    programPropertyName: 'MiningProgram',
                    exec: addMiningTokens
                },
                {
                    programName: 'Staking Program',
                    programPropertyName: 'stakingProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.stakingPower.value = payload.ownPower | 0
                        record.stakingTokensAwarded.value = payload.awarded.tokens | 0
                    },
                    exec: addPropertyTokens
                },
                {
                    programName: 'Voting Program',
                    programPropertyName: 'votingProgram',
                    setProperties: (record, payload, userProfile) => {
                        record.votingOwnPower.value = payload.ownPower - userProfile.payload.reputation | 0
                        record.votingIncoming.value = payload.incomingPower | 0,
                        record.votingReputation.value = userProfile.payload.reputation | 0
                        record.votingPower.value = payload.ownPower + payload.incomingPower | 0,
                        record.votingTokensBonus.value = payload.bonus.tokens | 0
                    },
                    exec: addPropertyTokensWithBonus
                },
                {
                    programName: 'Referral Program',
                    programPropertyName: 'referralProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.referralOwnPower.value = payload.ownPower | 0
                        record.referralIncoming.value = payload.incomingPower | 0,
                        record.referralTokensAwarded.value = payload.awarded.tokens | 0
                        record.referralDecendants.value = payload.awarded.count | 0,
                        record.referralTokensBonus.value = payload.bonus.tokens | 0
                    },
                    exec: addPropertyTokensWithBonus
                },
                {
                    programName: 'Influencer Program',
                    programPropertyName: 'influencerProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.influencersOwnPower.value = payload.ownPower | 0
                        record.influencersIncoming.value = payload.incomingPower | 0,
                        record.influencersTokensAwarded.value = payload.awarded.tokens | 0
                        record.influencersDecendants.value = payload.awarded.count | 0,
                        record.influencersTokensBonus.value = payload.bonus.tokens | 0
                    },
                    exec: addPropertyTokensWithBonus
                },
                {
                    programName: 'Mentorship Program',
                    programPropertyName: 'mentorshipProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.mentorsOwnPower.value = payload.ownPower | 0
                        record.mentorsIncoming.value = payload.incomingPower | 0,
                        record.mentorsTokensAwarded.value = payload.awarded.tokens | 0
                        record.mentorsDecendants.value = payload.awarded.count | 0,
                        record.mentorsTokensBonus.value = payload.bonus.tokens | 0
                    },
                    exec: addPropertyTokensWithBonus
                },
                {
                    programName: 'Support Program',
                    programPropertyName: 'supportProgram',
                    setProperties: (record, payload, _userProfile) => {
                        record.supportsOwnPower.value = payload.ownPower | 0
                        record.supportsIncoming.value = payload.incomingPower | 0,
                        record.supportsTokensAwarded.value = payload.awarded.tokens | 0
                        record.supportsDecendants.value = payload.awarded.count | 0,
                        record.supportsTokensBonus.value = payload.bonus.tokens | 0
                    },
                    exec: addPropertyTokensWithBonus
                },
            ]
        }

        /*
         * Transform the result array into table records.
         */
        for (let j = 0; j < userProfiles.length; j++) {
            let userProfile = userProfiles[j]
    
            let tableRecord = newRecord(userProfile.name);
    
            tableRecord.blockchainPower.value = userProfile.payload.blockchainTokens | 0
            tableRecord.delegatedPower.value = userProfile.payload.tokenPower - userProfile.payload.blockchainTokens | 0
            tableRecord.tokenPower.value = userProfile.payload.tokenPower | 0
    
            for(let pIdx = 0; pIdx < tableRecordDefinition.properties.length; pIdx++) {
                const prop = tableRecordDefinition.properties[pIdx]
                prop.exec(userProfile, prop, tableRecord)
            }
    
            tableRecords.push(tableRecord)
        }
        const equalisedRecords = equaliseRecords(tableRecords)
        const recordList = recordsAsSortedList(equalisedRecords)
        return recordsToRows(recordList, tableRecordDefinition.headers)
    
        /**
         * @returns {TableRecord}
         */
        function newRecord(name) {
            return {
                name: { value: name, order: 1 },
                blockchainPower: { value: 0, order: 2 },
                delegatedPower: { value: 0, order: 3 },
                tokenPower: { value: 0, order: 4 },
                airdropPower: { value: 0, order: 5 },
                airdropTokensAwarded: { value: 0, order: 6 },
                claimPower: { value: 0, order: 7 },
                claimTokensAwarded: { value: 0, order: 8 },
                computingPower: { value: 0, order: 9 },
                computingPercentage: { value: 0, order: 10 },
                computingTokensAwarded: { value: 0, order: 11 },
                delegationPower: { value: 0, order: 12 },
                delegationTokensBonus: { value: 0, order: 13 },
                githubForks: { value: 0, order: 14 },
                githubPower: { value: 0, order: 15 },
                githubStars: { value: 0, order: 16 },
                githubTokensAwarded: { value: 0, order: 17 },
                githubWatching: { value: 0, order: 18 },
                miningBlockchainAccount: { value: 0, order: 19 },
                miningMinedInBTC: { value: 0, order: 20 },
                miningTokensAwarded: { value: 0, order: 21 },
                miningTokensBonus: { value: 0, order: 22 },
                miningTokensMined: { value: 0, order: 23 },
                stakingPower: { value: 0, order: 24 },
                stakingTokensAwarded: { value: 0, order: 25 },
                votingIncoming: { value: 0, order: 26 },
                votingOwnPower: { value: 0, order: 27 },
                votingPower: { value: 0, order: 28 },
                votingReputation: { value: 0, order: 29 },
                votingTokensBonus: { value: 0, order: 30 },
                referralOwnPower: { value: 0, order: 31 },
                referralIncoming: { value: 0, order: 32 },
                referralTokensAwarded: { value: 0, order: 33 },
                referralDecendants: { value: 0, order: 34 },
                referralTokensBonus: { value: 0, order: 35 },
                influencersOwnPower: { value: 0, order: 36 },
                influencersIncoming: { value: 0, order: 37 },
                influencersTokensAwarded: { value: 0, order: 38 },
                influencersDecendants: { value: 0, order: 39 },
                influencersTokensBonus: { value: 0, order: 40 },
                mentorsOwnPower: { value: 0, order: 41 },
                mentorsIncoming: { value: 0, order: 42 },
                mentorsTokensAwarded: { value: 0, order: 43 },
                mentorsDecendants: { value: 0, order: 44 },
                mentorsTokensBonus: { value: 0, order: 45 },
                supportsOwnPower: { value: 0, order: 46 },
                supportsIncoming: { value: 0, order: 47 },
                supportsTokensAwarded: { value: 0, order: 48 },
                supportsDecendants: { value: 0, order: 49 },
                supportsTokensBonus: { value: 0, order: 50 },
                liquidityRecords: [],
            }
        }
    
        /**
         * 
         * @returns {LiquidityRecord}
         */
        function newLiquidityRecord() {
            return {
                liquidityMarket: { value: '', order: 0 },
                liquidityExchange: { value: '', order: 1 },
                liquidityPower: { value: 0, order: 2 },
                liquidityPercentage: { value: 0, order: 3 },
                liquidityTokensAwarded: { value: 0, order: 4 },
            }
        }
    
        /**
         * 
         * @param {UserProfile} userProfile 
         * @param {TablePropertyDefinition} prop
         * @param {TableRecord} tableRecord 
         */
        function addPropertyTokens(userProfile, prop, tableRecord) {
            if (userProfile.tokenPowerSwitch === undefined) { return }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, prop.programName)
            if (program === undefined) { return }
            if (program.payload === undefined) { return }
            if (program.payload[prop.programPropertyName] === undefined) { return }
    
            prop.setProperties(tableRecord, program.payload[prop.programPropertyName])
        }
    
        /**
         * 
         * @param {UserProfile} userProfile 
         * @param {TablePropertyDefinition} prop
         * @param {TableRecord} tableRecord 
         */
        function addLiquidityTokens(userProfile, prop, tableRecord) {
            if (userProfile.tokenPowerSwitch === undefined) { return }
            let liquidityProgramList = UI.projects.governance.globals.saToken.SA_TOKEN_LIQUIDITY_POOL_LIST
            for (let liqProgram of liquidityProgramList) {
                let liqAsset = liqProgram['pairedAsset']
                let liqExchange = liqProgram['exchange']
    
                let configPropertyObject = {
                    "asset": liqAsset,
                    "exchange": liqExchange
                }
                let program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configPropertyObject)
                /* If nothing found, interpret empty as PANCAKE for backwards compatibility */
                if (program === undefined && liqExchange === "PANCAKE") {
                    configPropertyObject["exchange"] = null
                    program = UI.projects.governance.utilities.validations.onlyOneProgramBasedOnMultipleConfigProperties(userProfile, "Liquidity Program", configPropertyObject) 
                }
                if (program === undefined) { continue }
                if (program.payload === undefined) { continue }
                if (program.payload[prop.programPropertyName] === undefined) { continue }
    
                const liquidity = newLiquidityRecord()
                liquidity.liquidityMarket.value = 'SA / ' + liqAsset,
                liquidity.liquidityExchange.value = liqExchange,
                liquidity.liquidityPower.value = program.payload[prop.programPropertyName].ownPower,
                liquidity.liquidityPercentage.value = program.payload[prop.programPropertyName].awarded.percentage / 100,
                liquidity.liquidityTokensAwarded.value = program.payload[prop.programPropertyName].awarded.tokens | 0,
                tableRecord.liquidityRecords.push(liquidity)
            }
        }
    
        /**
         * 
         * @param {UserProfile} userProfile 
         * @param {TablePropertyDefinition} prop
         * @param {TableRecord} tableRecord 
         */
        function addMiningTokens(userProfile, prop, tableRecord) {
            if (userProfile.payload === undefined) { return }
            if (userProfile.tokensMined === undefined) { return }
            if (userProfile.tokensMined.payload === undefined) { return }
            if (userProfile.tokensMined.payload.tokensMined === undefined) { return }
    
            tableRecord.miningBlockchainAccount.value = userProfile.payload.blockchainAccount
            tableRecord.miningTokensAwarded.value = userProfile.tokensMined.payload.tokensMined.awarded | 0
            tableRecord.miningTokensBonus.value = userProfile.tokensMined.payload.tokensMined.bonus | 0
            tableRecord.miningTokensMined.value = userProfile.tokensMined.payload.tokensMined.total | 0
            tableRecord.miningMinedInBTC.value = UI.projects.governance.utilities.conversions.estimateSATokensInBTC(userProfile.tokensMined.payload.tokensMined.total | 0)
        }
    
        /**
         * 
         * @param {UserProfile} userProfile 
         * @param {TablePropertyDefinition} prop
         * @param {TableRecord} tableRecord 
         */
        function addPropertyTokensWithBonus(userProfile, prop, tableRecord) {
            if (userProfile.tokenPowerSwitch === undefined) { return }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, prop.programName)
            if (program === undefined) { return }
            if (program.payload === undefined) { return }
            if (program.payload[prop.programPropertyName] === undefined) { return }
            if (program.payload[prop.programPropertyName].bonus === undefined) { return }
    
            prop.setProperties(tableRecord, program.payload[prop.programPropertyName], userProfile)
        }
    
        /**
         * 
         * @param {TableRecord[]} records 
         * @returns {TableRecord[]}
         */
        function equaliseRecords(records) {
            const start = Object.values(newRecord()).filter(x => Object.hasOwn(x, 'order')).length + 1
            let liquidityMax = 0
            for(let i = 0; i < records.length; i++) {
                if(records[i].liquidityRecords.length > liquidityMax) {
                    liquidityMax = records[i].liquidityRecords.length
                }
            }
            for(let i = 0; i < records.length; i++) {
                const record = records[i]
                equaliseLiquidityRecords(record.liquidityRecords, liquidityMax, start)
            }
            return records
    
            /**
             * 
             * @param {LiquidityRecord[]} liquidityRecords 
             * @param {number} max 
             * @param {number} start 
             */
            function equaliseLiquidityRecords(liquidityRecords, max, start) {
                while(liquidityRecords.length < max) {
                    liquidityRecords.push(newLiquidityRecord())
                }
                for(let n = 0; n < max; n++) {
                    const r = liquidityRecords[n]
                    const count = (n * 5) + start
                    updateRecordOrder(r.liquidityExchange, count)
                    updateRecordOrder(r.liquidityMarket, count)
                    updateRecordOrder(r.liquidityPercentage, count)
                    updateRecordOrder(r.liquidityPower, count)
                    updateRecordOrder(r.liquidityTokensAwarded, count)
                }
            }
    
            /**
             * 
             * @param {RecordValue} record 
             * @param {number} count 
             */
            function updateRecordOrder(record, count) {
                record.order = record.order + count
            }
        }
    
        /**
         * 
         * @param {TableRecord[]} records 
         * @returns {[string,RecordValue][][]}
         */
        function recordsAsSortedList(records) {
            const list = []
            for(let i = 0; i < records.length; i++) {
                let innerList = []
                for (const [key, value] of Object.entries(records[i])) {
                    if(key == 'liquidityRecords') {
                        addLiquidityRows(value, innerList)
                    }
                    else {
                        innerList.push([key,value])
                    }
                }
                innerList.sort((a, b) => a[1].order - b[1].order)
                list.push(innerList)
            }
            return list
        }
    
        /**
         * 
         * @param {LiquidityRecord[]} records 
         * @param {string[]} rows
         */
        function addLiquidityRows(records, rows) {
            for(let i = 0; i < records.length; i++) {
                const record = records[i]
                for (const [key, value] of Object.entries(record)) {
                    rows.push([key,value])
                }
            }
        }
    }
        
    /**
     * 
     * @param {[string, RecordValue][][]} records 
     * @param {{
     *  label: string, 
     *  name: string
     * }[]} definitionHeaders
     * @returns {string[]}
     */
    function recordsToRows(records, definitionHeaders) {
        const headers = []
        const rows = []
        let addHeaders = true

        for(let i = 0; i < records.length; i++) {
            addHeaders = i == 0
            const record = records[i]
            rows.push(recordToRow(record, headers, addHeaders).join(','))
        }

        return [headers.join(',')].concat(rows)

        /**
         * 
         * @param {[string,RecordValue][]} record
         * @param {string[]} headers
         * @param {boolean} addHeaders
         * @returns {string[]}
         */
        function recordToRow(record, headers, addHeaders) {
            const row = []
            for(let i = 0; i < record.length; i++) {
                const key = record[i][0]
                if(addHeaders) {
                    const headerMatch = definitionHeaders.filter(x => x.name == key)
                    if(headerMatch.length == 1) {
                        headers.push(headerMatch[0].label)
                    }
                    else {
                        headers.push(key)
                    }
                }
                row.push(record[i][1].value)
            }
            return row
        }
    }
}

exports.newGovernanceReportsCsvExport = newGovernanceReportsCsvExport

/**
 * @typedef TablePropertyDefinition
 * @property {string} programName
 * @property {string} programPropertyName
 * @property {(record: TableRecord, payload: *, userProfile?: UserProfile) => void} setProperties
 * @property {(userProfile: UserProfile, prop: TablePropertyDefinition, tableRecord: TableRecord) => void} exec
 */

/**
 * @typedef TableRecord
 * @property {RecordValue} name
 * @property {RecordValue} blockchainPower
 * @property {RecordValue} delegatedPower
 * @property {RecordValue} tokenPower
 * @property {RecordValue} airdropPower
 * @property {RecordValue} airdropTokensAwarded
 * @property {RecordValue} claimPower
 * @property {RecordValue} claimTokensAwarded
 * @property {RecordValue} computingPower
 * @property {RecordValue} computingPercentage
 * @property {RecordValue} computingTokensAwarded
 * @property {RecordValue} delegationPower
 * @property {RecordValue} delegationTokensBonus
 * @property {RecordValue} githubForks
 * @property {RecordValue} githubPower
 * @property {RecordValue} githubStars
 * @property {RecordValue} githubTokensAwarded
 * @property {RecordValue} githubWatching
 * @property {RecordValue} miningBlockchainAccount
 * @property {RecordValue} miningTokensAwarded
 * @property {RecordValue} miningTokensBonus
 * @property {RecordValue} miningTokensMined
 * @property {RecordValue} miningMinedInBTC
 * @property {RecordValue} stakingPower
 * @property {RecordValue} stakingTokensAwarded
 * @property {RecordValue} votingOwnPower
 * @property {RecordValue} votingIncoming
 * @property {RecordValue} votingReputation
 * @property {RecordValue} votingPower
 * @property {RecordValue} votingTokensBonus
 * @property {RecordValue} referralOwnPower
 * @property {RecordValue} referralIncoming
 * @property {RecordValue} referralTokensAwarded
 * @property {RecordValue} referralDecendants
 * @property {RecordValue} referralTokensBonus
 * @property {RecordValue} influencersOwnPower
 * @property {RecordValue} influencersIncoming
 * @property {RecordValue} influencersTokensAwarded
 * @property {RecordValue} influencersDecendants
 * @property {RecordValue} influencersTokensBonus
 * @property {RecordValue} mentorsOwnPower
 * @property {RecordValue} mentorsIncoming
 * @property {RecordValue} mentorsTokensAwarded
 * @property {RecordValue} mentorsDecendants
 * @property {RecordValue} mentorsTokensBonus
 * @property {RecordValue} supportsOwnPower
 * @property {RecordValue} supportsIncoming
 * @property {RecordValue} supportsTokensAwarded
 * @property {RecordValue} supportsDecendants
 * @property {RecordValue} supportsTokensBonus
 * @property {LiquidityRecord[]} liquidityRecords
*/

/** 
 * @typedef RecordValue
 * @property {string|number} value
 * @property {number} order
 */

/**
 * @typedef CommonRecord
 * @property {RecordValue} name
 * @property {RecordValue} tokensReward
 * @property {RecordValue} rewardsInBTC
 * @property {RecordValue} weight
 * @property {RecordValue} weightPower
 */

/**
 * @typedef CommonRecordMap
 * @property {CommonRecord[]} assets
 * @property {CommonRecord[]} features
 * @property {CommonRecord[]} pools
 * @property {CommonRecord[]} positions
 */

/**
 * @typedef LiquidityRecord
 * @property {RecordValue} liquidityMarket
 * @property {RecordValue} liquidityExchange
 * @property {RecordValue} liquidityPower
 * @property {RecordValue} liquidityPercentage
 * @property {RecordValue} liquidityTokensAwarded
 */

/**
 * @typedef UserProfile
 * @property {string} name
 * @property {*} tokenPowerSwitch
 * @property {UserProfilePayload} payload
 */

/**
 * @typedef UserProfilePayload
 * @property {number} blockchainTokens
 * @property {number} tokenPower
 */

/**
 * @typedef CsvResponse
 * @property {string[]} userProfiles
 * @property {string[]} assets
 * @property {string[]} features
 * @property {string[]} pools
 * @property {string[]} positions
 */