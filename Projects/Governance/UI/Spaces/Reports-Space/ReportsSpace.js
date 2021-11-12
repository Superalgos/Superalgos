function newGobernanceReportsSpace() {
    const MODULE_NAME = 'Reports Space'

    let thisObject = {
        container: undefined,
        sidePanelTab: undefined,
        reportsPage: undefined,
        footer: undefined,
        filtersHeader: undefined,
        userProfiles: undefined,
        referrals: undefined,
        supports: undefined,
        mentors: undefined,
        influencers: undefined,
        claims: undefined,
        votes: undefined,
        staking: undefined,
        liquidity: undefined,
        delegations: undefined,
        github: undefined,
        airdrop: undefined,
        pools: undefined,
        assets: undefined,
        features: undefined,
        positions: undefined,
        mining: undefined,
        tablesSortingOrders: undefined,
        commandInterface: undefined,
        changeTableSortingOrder,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize,
        reset: reset
    }

    let browserResizedEventSubscriptionId
    let openingEventSubscriptionId
    let closingEventSubscriptionId

    let isInitialized = false

    return thisObject

    function finalize() {

        if (isInitialized === false) { return }

        hidAppDiv()

        thisObject.container.finalize()
        thisObject.container = undefined

        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)
        thisObject.sidePanelTab = undefined

        UI.projects.foundations.spaces.sideSpace.deleteSidePanelTab('Governance', 'governance-tab', 'Gov', 'right')

        thisObject.reportsPage.finalize()
        thisObject.reportsPage = undefined

        thisObject.footer.finalize()
        thisObject.footer = undefined

        thisObject.filtersHeader.finalize()
        thisObject.filtersHeader = undefined

        thisObject.userProfiles.finalize()
        thisObject.userProfiles = undefined

        thisObject.referrals.finalize()
        thisObject.referrals = undefined

        thisObject.supports.finalize()
        thisObject.supports = undefined

        thisObject.mentors.finalize()
        thisObject.mentors = undefined

        thisObject.influencers.finalize()
        thisObject.influencers = undefined

        thisObject.claims.finalize()
        thisObject.claims = undefined

        thisObject.votes.finalize()
        thisObject.votes = undefined

        thisObject.staking.finalize()
        thisObject.staking = undefined

        thisObject.liquidity.finalize()
        thisObject.liquidity = undefined

        thisObject.delegation.finalize()
        thisObject.delegation = undefined

        thisObject.github.finalize()
        thisObject.github = undefined

        thisObject.airdrop.finalize()
        thisObject.airdrop = undefined

        thisObject.pools.finalize()
        thisObject.pools = undefined

        thisObject.assets.finalize()
        thisObject.assets = undefined

        thisObject.features.finalize()
        thisObject.features = undefined

        thisObject.positions.finalize()
        thisObject.positions = undefined

        thisObject.mining.finalize()
        thisObject.mining = undefined

        thisObject.commandInterface.finalize()
        thisObject.commandInterface = undefined

        isInitialized = false
    }

    function initialize() {
        /*
        If the workspace is not related to governance, then we exit the initialize Function
        */
        let governanceProject = UI.projects.foundations.spaces.designSpace.workspace.getProjectHeadByNodeType('Governance Project')
        if (governanceProject === undefined) { return }

        thisObject.container = newContainer()
        thisObject.container.name = MODULE_NAME
        thisObject.container.initialize()
        thisObject.container.isClickeable = true
        thisObject.container.isDraggeable = false
        thisObject.container.detectMouseOver = true
        thisObject.container.status = 'hidden'

        resize()

        thisObject.commandInterface = newGovernanceReportsCommmandInterface()
        thisObject.reportsPage = newGovernanceReportsReportsPage()
        thisObject.footer = newGovernanceReportsFooter()
        thisObject.filtersHeader = newGovernanceReportsFiltersHeader()
        thisObject.userProfiles = newGovernanceReportsUserProfiles()
        thisObject.referrals = newGovernanceReportsReferrals()
        thisObject.supports = newGovernanceReportsSupports()
        thisObject.influencers = newGovernanceReportsInfluencers()
        thisObject.mentors = newGovernanceReportsMentors()
        thisObject.claims = newGovernanceReportsClaims()
        thisObject.votes = newGovernanceReportsVotes()
        thisObject.staking = newGovernanceReportsStaking()
        thisObject.liquidity = newGovernanceReportsLiquidity()
        thisObject.delegation = newGovernanceReportsDelegation()
        thisObject.github = newGovernanceReportsGithub()
        thisObject.airdrop = newGovernanceReportsAirdrop()
        thisObject.pools = newGovernanceReportsPools()
        thisObject.assets = newGovernanceReportsAssets()
        thisObject.features = newGovernanceReportsFeatures()
        thisObject.positions = newGovernanceReportsPositions()
        thisObject.mining = newGovernanceReportsMining()

        thisObject.commandInterface.initialize()
        thisObject.reportsPage.initialize()
        thisObject.footer.initialize()
        thisObject.filtersHeader.initialize()
        thisObject.userProfiles.initialize()
        thisObject.referrals.initialize()
        thisObject.supports.initialize()
        thisObject.mentors.initialize()
        thisObject.influencers.initialize()
        thisObject.claims.initialize()
        thisObject.votes.initialize()
        thisObject.staking.initialize()
        thisObject.liquidity.initialize()
        thisObject.delegation.initialize()
        thisObject.github.initialize()
        thisObject.airdrop.initialize()
        thisObject.pools.initialize()
        thisObject.assets.initialize()
        thisObject.features.initialize()
        thisObject.positions.initialize()
        thisObject.mining.initialize()

        setupSidePanelTab()

        thisObject.tablesSortingOrders = {}

        isInitialized = true

        function setupSidePanelTab() {

            thisObject.sidePanelTab = UI.projects.foundations.spaces.sideSpace.createSidePanelTab(thisObject.container, 'Governance', 'governance-tab', 'Gov', 'right')

            openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
            closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

            browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        }
    }

    function reset() {
        finalize()
        initialize()
    }

    function resize() {
        thisObject.container.frame.width = UI.projects.governance.globals.reports.REPORTS_SPACE_WIDTH
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function physics() {
        if (isInitialized === false) { return }

        docsAppDivPhysics()
    }

    function docsAppDivPhysics() {
        let docsSpaceDiv = document.getElementById('governance-reports-space-div')
        docsAppDivPosition = {
            x: 0,
            y: 0
        }
        docsAppDivPosition = thisObject.container.frame.frameThisPoint(docsAppDivPosition)
        docsSpaceDiv.style = '   ' +
            'overflow-y: scroll;' +
            'overflow-x: hidden;' +
            'position:fixed; top:' + docsAppDivPosition.y + 'px; ' +
            'left:' + docsAppDivPosition.x + 'px; z-index:1; ' +
            'width: ' + thisObject.container.frame.width + 'px;' +
            'height: ' + thisObject.container.frame.height + 'px'
    }

    function hidAppDiv() {
        let docsSpaceDiv = document.getElementById('governance-reports-space-div')
        docsAppDivPosition = {
            x: 100000000000,
            y: 0
        }
        docsAppDivPosition = thisObject.container.frame.frameThisPoint(docsAppDivPosition)
        docsSpaceDiv.style = '   ' +
            'overflow-y: scroll;' +
            'overflow-x: hidden;' +
            'position:fixed; top:' + docsAppDivPosition.y + 'px; ' +
            'left:' + docsAppDivPosition.x + 'px; z-index:1; ' +
            'width: ' + thisObject.container.frame.width + 'px;' +
            'height: ' + thisObject.container.frame.height + 'px'
    }

    function getContainer(point, purpose) {
        if (isInitialized === false) { return }
        if (thisObject.sidePanelTab === undefined) { return }
        let container

        container = thisObject.sidePanelTab.getContainer(point, purpose)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function changeTableSortingOrder(table, property, order, tabIndex) {
        thisObject.tablesSortingOrders[table].property = property
        thisObject.tablesSortingOrders[table].order = order
        thisObject.reportsPage.render(tabIndex)
    }

    function onOpening() {
        thisObject.reportsPage.render()
    }

    function onClosing() {

    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (isInitialized === false) { return }
        borders()
    }

    function borders() {
        let point1
        let point2
        let point3
        let point4

        point1 = {
            x: 0,
            y: 0
        }

        point2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        point3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        point4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)
        point4 = thisObject.container.frame.frameThisPoint(point4)

        browserCanvasContext.setLineDash([]) // Resets Line Dash
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        let opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + opacity + ''
        browserCanvasContext.fill()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 0.3
        browserCanvasContext.stroke()

        /* Shadow */

        if (thisObject.container.status !== 'hidden') {
            for (let i = 0; i <= 30; i++) {
                opacity = 1 - (i / 300) - 0.95

                browserCanvasContext.setLineDash([]) // Resets Line Dash
                browserCanvasContext.beginPath()
                browserCanvasContext.moveTo(point2.x + i, point2.y)
                browserCanvasContext.lineTo(point3.x + i, point3.y)
                browserCanvasContext.closePath()

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()
            }
        }
    }
}
