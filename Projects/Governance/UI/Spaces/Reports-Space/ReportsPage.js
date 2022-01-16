function newGovernanceReportsReportsPage() {
    let thisObject = {
        render: render,
        initialize: initialize,
        finalize: finalize
    }

    let lastTabIndex
    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function render(tabIndex, filters) {

        /* Setup tabIndex */
        if (tabIndex === undefined) {
            tabIndex = lastTabIndex
        } else {
            lastTabIndex = tabIndex
        }

        let resultsArary = []
        let initialTime = new Date()
        buildHTML()

        function buildHTML() {
            const tabs = [
                'Profiles',
                'Airdrop',
                'Github',
                'Referrals',
                'Supporters',
                'Mentors',
                'Influencers',
                'Claims',
                'Votes',
                'Staking',
                'Liquidity',
                'Delegation',
                'Pools',
                'Assets',
                'Features',
                'Positions',
                'Mining'
            ]
            let HTML = ''
            HTML = HTML + '<section id="governance-report-page-div" class="governance-search-page-container">'
            HTML = HTML + UI.projects.governance.spaces.reportsSpace.filtersHeader.addFilterHeader()

            // Tabs
            HTML = HTML + '<div class="governance-report-page-header-tabs-container">'
            let checked = ' checked=""'
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML + '<input id="governance-tab' + (i + 1) + '" type="radio" name="tabs"' + checked + '><label for="governance-tab' + (i + 1) + '">' + tab + '</label>'
                checked = ''
            }

            // Results
            HTML = HTML + '<div class="governance-search-result-content">'

            let totalResults = new Map()
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML + '<div id="content' + (i + 1) + '">'
                HTML = HTML + '<p> ' + tab.toUpperCase() + '_TOTAL_RESULTS results (' + tab.toUpperCase() + '_TOTAL_SECONDS seconds)</p>'

                let resultCounter = 0

                switch (tab) {
                    case 'Profiles': {
                        let response = UI.projects.governance.spaces.reportsSpace.userProfiles.addHTML(1, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Airdrop': {
                        let response = UI.projects.governance.spaces.reportsSpace.airdrop.addHTML(2, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Github': {
                        let response = UI.projects.governance.spaces.reportsSpace.github.addHTML(3, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Referrals': {
                        let response = UI.projects.governance.spaces.reportsSpace.referrals.addHTML(4, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Supporters': {
                        let response = UI.projects.governance.spaces.reportsSpace.supports.addHTML(5, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Mentors': {
                        let response = UI.projects.governance.spaces.reportsSpace.mentors.addHTML(6, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Influencers': {
                        let response = UI.projects.governance.spaces.reportsSpace.influencers.addHTML(7, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Claims': {
                        let response = UI.projects.governance.spaces.reportsSpace.claims.addHTML(8, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Votes': {
                        let response = UI.projects.governance.spaces.reportsSpace.votes.addHTML(9, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Staking': {
                        let response = UI.projects.governance.spaces.reportsSpace.staking.addHTML(10, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Liquidity': {
                        let response = UI.projects.governance.spaces.reportsSpace.liquidity.addHTML(11, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Delegation': {
                        let response = UI.projects.governance.spaces.reportsSpace.delegation.addHTML(12, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Pools': {
                        let response = UI.projects.governance.spaces.reportsSpace.pools.addHTML(13, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Assets': {
                        let response = UI.projects.governance.spaces.reportsSpace.assets.addHTML(14, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Features': {
                        let response = UI.projects.governance.spaces.reportsSpace.features.addHTML(15, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Positions': {
                        let response = UI.projects.governance.spaces.reportsSpace.positions.addHTML(16, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                    case 'Mining': {
                        let response = UI.projects.governance.spaces.reportsSpace.mining.addHTML(17, filters)
                        HTML = HTML + response.HTML
                        resultCounter = response.resultCounter
                        break
                    }
                }

                HTML = HTML + '</div>'
                totalResults.set(tab, resultCounter)
            }

            // End Content
            HTML = HTML + '</div>'
            HTML = HTML + '</div>'

            // End Section
            HTML = HTML + '</section>'

            // Total Seconds Calculation
            let finalTime = new Date()
            let totalSeconds = ((finalTime.valueOf() - initialTime.valueOf()) / 1000).toFixed(3)
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_SECONDS', totalSeconds)
                let resultCounter = totalResults.get(tab)
                HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_RESULTS', resultCounter)
            }

            let docsContentDiv = document.getElementById('governance-content-div')

            docsContentDiv.innerHTML = HTML + UI.projects.governance.spaces.reportsSpace.footer.addFooter()

            UI.projects.governance.spaces.reportsSpace.filtersHeader.detectEnterOnFiltersBox()
            UI.projects.governance.spaces.reportsSpace.filtersHeader.setFocusOnFiltersBox()

            // If there is a tabIndex we will switch to that tab here.
            if (tabIndex !== undefined) {
                let tab = document.getElementById('governance-tab' + tabIndex)
                tab.checked = true
            }
        }
    }
}