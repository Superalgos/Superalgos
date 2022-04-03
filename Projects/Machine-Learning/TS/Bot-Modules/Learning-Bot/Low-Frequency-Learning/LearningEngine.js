exports.newMachineLearningBotModulesLearningEngine = function (processIndex) {
    /*
    We call the Learning Engine to the data structure that is needed in order to execute the
    learning protocol with the specific rules defined at the Learning System.
    */
    let thisObject = {
        mantain: mantain,
        reset: reset,
        getNodeById: getNodeById,
        cloneValues: cloneValues,
        setCurrentCandle: setCurrentCandle,
        setCurrentCycle: setCurrentCycle,
        initializeNode: initializeNode,
        initialize: initialize,
        finalize: finalize
    }

    let learningEngine
    let sessionParameters
    let nodesMap = new Map()

    return thisObject

    function initialize() {

        learningEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.learningEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.learningParameters

        initializeNodeMap(learningEngine)

        if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).IS_SESSION_FIRST_LOOP === true) {
            /* 
            Here we will go through all the nodes in the Learning Engine hierarchy and
            apply the initial value to the value property when needed 
             */
            initializeNode(learningEngine)
        }
    }

    function finalize() {
        learningEngine = undefined
        sessionParameters = undefined
        nodesMap = undefined
    }

    function mantain() {
    }

    function reset() {

    }

    function getNodeById(NodeId) {
        return nodesMap.get(NodeId)
    }

    function setCurrentCandle(candle) {
        learningEngine.learningCurrent.learningEpisode.candle.begin.value = candle.begin
        learningEngine.learningCurrent.learningEpisode.candle.end.value = candle.end
        learningEngine.learningCurrent.learningEpisode.candle.open.value = candle.open
        learningEngine.learningCurrent.learningEpisode.candle.close.value = candle.close
        learningEngine.learningCurrent.learningEpisode.candle.min.value = candle.min
        learningEngine.learningCurrent.learningEpisode.candle.max.value = candle.max
    }

    function setCurrentCycle(cycle) {
        learningEngine.learningCurrent.learningEpisode.cycle.value = cycle
        learningEngine.learningCurrent.learningEpisode.cycle.lastBegin.value = learningEngine.learningCurrent.learningEpisode.cycle.begin.value
        learningEngine.learningCurrent.learningEpisode.cycle.lastEnd.value = learningEngine.learningCurrent.learningEpisode.cycle.end.value
        switch (cycle) {
            case 'First': {
                learningEngine.learningCurrent.learningEpisode.cycle.begin.value =
                    learningEngine.learningCurrent.learningEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value
                learningEngine.learningCurrent.learningEpisode.cycle.end.value =
                    learningEngine.learningCurrent.learningEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value / 2 - 1
                break
            }
            case 'Second': {
                learningEngine.learningCurrent.learningEpisode.cycle.begin.value =
                    learningEngine.learningCurrent.learningEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value / 2
                learningEngine.learningCurrent.learningEpisode.cycle.end.value =
                    learningEngine.learningCurrent.learningEpisode.candle.begin.value +
                    sessionParameters.timeFrame.config.value +
                    sessionParameters.timeFrame.config.value * 4 / 4 - 1
                break
            }
        }
        /* 
        We can not have the last begin or last end to be zero, because that would prevent
        objects starting with lastBegin in zero to being saved on file. For that reason
        we will do this:
        */
        if (learningEngine.learningCurrent.learningEpisode.cycle.lastBegin.value === 0) {
            learningEngine.learningCurrent.learningEpisode.cycle.lastBegin.value = learningEngine.learningCurrent.learningEpisode.cycle.begin.value
        }
        if (learningEngine.learningCurrent.learningEpisode.cycle.lastEnd.value === 0) {
            learningEngine.learningCurrent.learningEpisode.cycle.lastEnd.value = learningEngine.learningCurrent.learningEpisode.cycle.end.value
        }
    }

    function cloneValues(originNode, destinationNode) {
        if (originNode === undefined) { return }
        if (destinationNode === undefined) { return }

        /* Here copy the node value */
        destinationNode.value = originNode.value

        /* Now we go down through all the children  of the origin node, assuming the destination node has the same children structure*/
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(originNode.project + '-' + originNode.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (originNode[property.name] !== undefined && destinationNode[property.name] !== undefined) {
                                cloneValues(originNode[property.name], destinationNode[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (originNode[property.name] !== undefined && destinationNode[property.name] !== undefined) {
                            let originNodePropertyArray = originNode[property.name]
                            let destinationNodePropertyArray = destinationNode[property.name]
                            for (let m = 0; m < originNodePropertyArray.length; m++) {
                                cloneValues(originNodePropertyArray[m], destinationNodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function initializeNodeMap(node) {
        if (node === undefined) { return }
        /* Add to Node Map */
        nodesMap.set(node.id, node)

        /* Now we go down through all this node children */
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                initializeNodeMap(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                initializeNodeMap(nodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function initializeNode(node) {
        if (node === undefined) { return }

        /* Here we initialize the node value */
        if (node.config !== undefined) {
            if (node.config.initialValue !== undefined) {
                node.value = node.config.initialValue
            }
        }

        /* Now we go down through all this node children */
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(node.project + '-' + node.type)
        if (schemaDocument === undefined) { return }

        if (schemaDocument.childrenNodesProperties !== undefined) {
            let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]

                switch (property.type) {
                    case 'node': {
                        if (property.name !== previousPropertyName) {
                            if (node[property.name] !== undefined) {
                                initializeNode(node[property.name])
                            }
                            previousPropertyName = property.name
                        }
                        break
                    }
                    case 'array': {
                        if (node[property.name] !== undefined) {
                            let nodePropertyArray = node[property.name]
                            for (let m = 0; m < nodePropertyArray.length; m++) {
                                initializeNode(nodePropertyArray[m])
                            }
                        }
                        break
                    }
                }
            }
        }
    }
}

