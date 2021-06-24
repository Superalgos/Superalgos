function newGovernanceFunctionLibraryTokenPower() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        userProfiles
    ) {
        /*
        We will first reset all the token power, and then distribute it to each Program.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            resetTokenPower(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            distributeProfile(userProfile)
        }

        function resetTokenPower(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.tokenPower = 0
            /*
            When we reach certain node types, we will halt the distribution, because these are targets for 
            token power.
            */
            if (
                node.type === 'Referral Program' ||
                node.type === 'Mentorship Program' ||
                node.type === 'Support Program' ||
                node.type === 'Voting Program' ||
                node.type === 'Claims Program' ||
                node.type === 'Staking Program'
            ) { return }
            /*
            We will reset token power of children.
            */
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            resetTokenPower(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    resetTokenPower(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function distributeProfile(userProfile) {
            if (userProfile.payload === undefined) { return }
            let tokenPower
            if (userProfile.payload.blockchainTokens === undefined) {
                return
            } else {
                tokenPower = userProfile.payload.blockchainTokens
            }
            /*
            Before we start we will do some validations:
            */
            if (userProfile.tokenPowerSwitch === undefined) {
                userProfile.payload.uiObject.setErrorMessage("You need to have a Token Power Switch child node.")
                return
            }
            if (userProfile.tokenPowerSwitch.referralProgram === undefined) {
                userProfile.tokenPowerSwitch.payload.uiObject.setErrorMessage("You need to have a Referral Program child node.")
                return
            }
            if (userProfile.tokenPowerSwitch.mentorshipProgram === undefined) {
                userProfile.tokenPowerSwitch.payload.uiObject.setErrorMessage("You need to have a Mentorship Program child node.")
                return
            }
            if (userProfile.tokenPowerSwitch.supportProgram === undefined) {
                userProfile.tokenPowerSwitch.payload.uiObject.setErrorMessage("You need to have a Spupport Program child node.")
                return
            }

            distributeTokenPower(userProfile, tokenPower)
        }

        function distributeTokenPower(node, tokenPower, switchPercentage) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.tokenPower = node.payload.tokenPower + tokenPower
            drawTokenPower(node, node.payload.tokenPower, switchPercentage)
            /*
            When we reach certain node types, we will halt the distribution, 
            because these are targets for token power.
            */
            if (
                node.type === 'Referral Program' ||
                node.type === 'Mentorship Program' ||
                node.type === 'Support Program' ||
                node.type === 'Voting Program' ||
                node.type === 'Claims Program' ||
                node.type === 'Staking Program'
            ) { return }
            /*
            We will redistribute token power among children.
            */
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                /*
                Before distributing the token power, we will calculate how the power 
                is going to be switched between all nodes. The first pass is about
                scanning all sibling nodes to see which ones have a percentage defined
                at their config, and check that all percentages don't add more than 100.
                */
                let totalPercentage = 0
                let totalNodesWithoutPercentage = 0
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            if (childNode === undefined) { continue }
                            let percentage = getPercentage(childNode)

                            if (percentage !== undefined && isNaN(percentage) !== true) {
                                totalPercentage = totalPercentage + percentage
                            } else {
                                totalNodesWithoutPercentage++
                            }
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    if (childNode === undefined) { continue }
                                    let percentage = getPercentage(childNode)
                                    if (percentage !== undefined && isNaN(percentage) !== true) {
                                        totalPercentage = totalPercentage + percentage
                                    } else {
                                        totalNodesWithoutPercentage++
                                    }
                                }
                            }
                            break
                        }
                    }
                }
                if (totalPercentage > 100) {
                    node.payload.uiObject.setErrorMessage('Token Power Switching Error. Total Percentage of children nodes is grater that 100.')
                    return
                }
                let defaultPercentage = 0
                if (totalNodesWithoutPercentage > 0) {
                    defaultPercentage = (100 - totalPercentage) / totalNodesWithoutPercentage
                }
                /*
                Here we do the actual distribution.
                */
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            if (childNode === undefined) { continue }
                            let percentage = getPercentage(childNode)
                            if (percentage === undefined || isNaN(percentage) === true) {
                                percentage = defaultPercentage
                            }
                            distributeTokenPower(childNode, tokenPower * percentage / 100, percentage)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    if (childNode === undefined) { continue }
                                    let percentage = getPercentage(childNode)
                                    if (percentage === undefined || isNaN(percentage) === true) {
                                        percentage = defaultPercentage
                                    }
                                    distributeTokenPower(childNode, tokenPower * percentage / 100, percentage)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function getPercentage(node) {
            return UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'percentage')
        }

        function drawTokenPower(node, tokenPower, percentage) {
            tokenPower = parseFloat(tokenPower.toFixed(2)).toLocaleString('en') + ' ' + 'Token Power'
            if (node.payload !== undefined) {
                if (node.type === 'User Profile') {
                    return
                }
                node.payload.uiObject.valueAngleOffset = 180
                node.payload.uiObject.valueAtAngle = true

                node.payload.uiObject.setValue(tokenPower)

                if (percentage !== undefined) {
                    node.payload.uiObject.percentageAngleOffset = 180
                    node.payload.uiObject.percentageAtAngle = true
                    node.payload.uiObject.setPercentage(percentage.toFixed(2))
                }
            }
        }
    }
}