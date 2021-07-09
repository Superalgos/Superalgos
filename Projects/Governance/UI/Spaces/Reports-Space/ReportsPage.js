function newGovernanceReportsReportsPage() {
    let thisObject = {
        render: render,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function render() {

        let resultsArary = []
        let initialTime = new Date()
        buildHTML()

        function buildHTML() {
            const tabs = ['Profiles', 'Referrals', 'Mentors', 'Supporters', 'Pools', 'Assets', 'Features', 'Positions']
            let HTML = ''
            HTML = HTML + '<section id="governance-report-page-div" class="governance-search-page-container">'
            HTML = HTML + UI.projects.education.spaces.docsSpace.mainSearchPage.addSearchHeader()

            // Tabs
            HTML = HTML + '<div class="governance-report-page-header-tabs-container">'
            let checked = ' checked=""'
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML + '<input id="tab' + (i + 1) + '" type="radio" name="tabs"' + checked + '><label for="tab' + (i + 1) + '">' + tab + '</label>'
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
                        HTML = HTML + UI.projects.governance.spaces.reportsSpace.userProfiles.addHTML()
                        resultCounter = UI.projects.governance.spaces.reportsSpace.userProfiles.resultCounter

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
                resultCounter = totalResults.get(tab)
                HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_RESULTS', resultCounter)
            }

            let docsContentDiv = document.getElementById('governance-content-div')
            docsContentDiv.innerHTML = HTML + UI.projects.governance.spaces.reportsSpace.footer.addFooter()

            UI.projects.education.spaces.docsSpace.mainSearchPage.detectEnterOnSearchBox()
            UI.projects.education.spaces.docsSpace.mainSearchPage.setFocusOnSearchBox()
        }
    }
}