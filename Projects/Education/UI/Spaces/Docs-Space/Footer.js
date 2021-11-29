function newFoundationsDocsFooter() {
    let thisObject = {
        addFooter: addFooter,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addFooter() {

        let HTML = ''

        HTML = HTML + '<div id="docs-footer" class="docs-node-html-footer-container">' // Container Starts

        // Buttons Section

        HTML = HTML + '<div class="docs-node-html-footer-table">'
        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell style="white-space: nowrap; overflow-x: auto;" >' // white-space: nowrap; overflow-x: auto; prevents line breaks when combined with display: inline-block;" in the child elements

        if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered !== undefined) {
            HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.sharePage()"><button>SHARE</button></span>'
        }
        HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.scrollToElement(\'docs-space-div\')"><button>TO TOP</button></span>'
        if (UI.projects.education.spaces.docsSpace.previousDocumentBeingRendered !== undefined) {
            HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.previousDocumentBeingRendered.project + '\', \'' + UI.projects.education.spaces.docsSpace.previousDocumentBeingRendered.category + '\', \'' + UI.projects.education.spaces.docsSpace.previousDocumentBeingRendered.type + '\')"><button>BACK</button></span>'
        }
        if (UI.projects.education.spaces.docsSpace.currentBookBeingRendered !== undefined) {
            HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentBookBeingRendered.project + '\', \'' + UI.projects.education.spaces.docsSpace.currentBookBeingRendered.category + '\', \'' + UI.projects.education.spaces.docsSpace.currentBookBeingRendered.type + '\')"><button>TO BOOK</button></span>'
        }

        HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'Reviews' + '\')"><button>REVIEWS</button></span>'
        HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'Community Data Mines' + '\')"><button>DATA MINES</button></span>'
        HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'First Steps Tutorials' + '\')"><button>TUTORIALS</button></span>'
        HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'User Manual' + '\')"><button>USER MANUAL</button></span>'

        HTML = HTML + '</div>'

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        // Language Section

        HTML = HTML + '<div class="docs-node-html-footer-table">'
        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell" style="white-space: nowrap; overflow-x: auto; ">'
        HTML = HTML + '<h3 style="display: inline-block;">Help Superalgos Speak Your Language!</h3>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-node-html-footer-table">'
        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Multi-language Docs</h4>'
        HTML = HTML + 'We produce the original Docs in English and you get the content in your preferred language only when translations are available. When not, you get the default content, in English.'
        HTML = HTML + '</div>'

        let languageCode = UI.projects.education.spaces.docsSpace.language

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Choose Your Language</h4>'
        HTML = HTML + 'Click on your preferred language:<br/>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'EN\')"><img src="Images/Languages/EN.png" title="English" class="docs-footer-language'
        if (languageCode === 'EN') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'ES\')"><img src="Images/Languages/ES.png" title="Spanish" class="docs-footer-language'
        if (languageCode === 'ES') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'RU\')"><img src="Images/Languages/RU.png" title="Russian" class="docs-footer-language'
        if (languageCode === 'RU') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'IT\')"><img src="Images/Languages/IT.png" title="Italian" class="docs-footer-language'
        if (languageCode === 'IT') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'DE\')"><img src="Images/Languages/DE.png" title="German" class="docs-footer-language'
        if (languageCode === 'DE') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'FR\')"><img src="Images/Languages/FR.png" title="French" class="docs-footer-language'
        if (languageCode === 'FR') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'CN\')"><img src="Images/Languages/CN.png" title="Simplified Chinese-Mandarin" class="docs-footer-language'
        if (languageCode === 'CN') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'ID\')"><img src="Images/Languages/ID.png" title="Bahasa" class="docs-footer-language'
        if (languageCode === 'ID') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'TR\')"><img src="Images/Languages/TR.png" title="Turkish" class="docs-footer-language'
        if (languageCode === 'TR') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'NL\')"><img src="Images/Languages/NL.png" title="Dutch" class="docs-footer-language'
        if (languageCode === 'NL') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'AR\')"><img src="Images/Languages/AR.png" title="Arabic" class="docs-footer-language'
        if (languageCode === 'AR') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'EL\')"><img src="Images/Languages/EL.png" title="Greek" class="docs-footer-language'
        if (languageCode === 'EL') { 
            HTML = HTML + '-selected'
        } 
        HTML = HTML + '"></a>'

        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Contribute Translations</h4>'
        HTML = HTML + 'Earn tokens by helping translate the Docs and tutorials to your native language! Search the Docs for How to Contribute Translations and join the Superalgos Docs Group to coordinate with other contributors...'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        // GitHub Section

        HTML = HTML + '<div class="docs-node-html-footer-table">'
        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell" style="white-space: nowrap; overflow-x: auto; ">'
        HTML = HTML + '<h3 style="display: inline-block;">Manage Your Superalgos Setup and Contributions!</h3>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-node-html-footer-table">'

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>About Your Deployment</h4>'
        HTML = HTML + 'Superalgos may run from different branches in the repository. The <code class="docs-footer-code">Master</code> branch features the stable version, and the <code class="docs-footer-code">Develop</code> branch the version in development.'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Choose the Current Branch</h4>'
        HTML = HTML + 'You are currently running on the <code class="docs-footer-code">' + UI.projects.foundations.utilities.gitBranches.getBranchLabel(UI.projects.education.spaces.docsSpace.currentBranch) + '</code> branch. Switch to:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.education.spaces.docsSpace.changeCurrentBranch(\'master\')">Master</a></li>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.education.spaces.docsSpace.changeCurrentBranch(\'develop\')">Develop</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Contributions Branch</h4>'
        HTML = HTML + 'You are currently contributing to the <code class="docs-footer-code">' + UI.projects.foundations.utilities.gitBranches.getBranchLabel(UI.projects.education.spaces.docsSpace.contributionsBranch) + '</code> branch. Switch to:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.education.spaces.docsSpace.changeContributionsBranch(\'master\')">Master</code></li>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.education.spaces.docsSpace.changeContributionsBranch(\'develop\')">Develop</a></li>'

        HTML = HTML + '</ul>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        // Community Section

        HTML = HTML + '<div class="docs-node-html-footer-table">'
        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell" style="white-space: nowrap; overflow-x: auto; ">'
        HTML = HTML + '<h3 style="display: inline-block;">Meet the Community and the Team!</h3>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-node-html-footer-table">'

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Join the Conversation</h4>'
        HTML = HTML + '<p>We have a new <a href="https://discord.gg/CGeKC6WQQb" target="_blank">Discord Server</a> with multiple channels and a new <a href="https://forum.superalgos.org/" target="_blank">Community Forum</a>.</p>'
        HTML = HTML + '<p>The community is a lot more active in the original Telegram groups listed on the right.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Telegram Groups</h4>'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://t.me/superalgoscommunity" target="_blank">Community</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgossupport" target="_blank">Technical Support</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosdevelop" target="_blank">Developers</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosdatamining" target="_blank">Data Mining</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosmachinelearning" target="_blank">Machine Learning</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosdocs" target="_blank">Docs/Education</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosuxui" target="_blank">UX/UI Design</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosmarketing" target="_blank">Marketing</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgostoken" target="_blank">Token</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgostrading" target="_blank">Trading</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgoscollaborations" target="_blank">Collaborations</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgoscodebase" target="_blank">Codebase Learning</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosnontechusers" target="_blank">Non-Tech Users</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Non-English Telegram Groups</h4>'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://t.me/superalgos_es" target="_blank">Spanish</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgos_ru" target="_blank">Russian</a></li>'
        HTML = HTML + '<li><a href="https://t.me/tr_superalgos" target="_blank">Turkish</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '<h4>Other Resources</h4>'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://t.me/superalgos" target="_blank">Official Announcements</a></li>'
        HTML = HTML + '<li><a href="https://superalgos.org" target="_blank">Features and Functionality</a></li>'
        HTML = HTML + '<li><a href="https://github.com/Superalgos/Superalgos" target="_blank">Main Github Repository</a></li>'
        HTML = HTML + '<li><a href="https://www.youtube.com/c/superalgos" target="_blank">Subscribe in YouTube</a></li>'
        HTML = HTML + '<li><a href="https://twitter.com/superalgos" target="_blank">Follow us on Twitter</a></li>'
        HTML = HTML + '<li><a href="https://www.facebook.com/superalgos" target="_blank">Connect on Facebook</a></li>'
        HTML = HTML + '<li><a href="https://medium.com/Superalgos/" target="_blank">Read the Blog</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<img src="Images/superalgos-logo-white.png" width="200 px">'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>' // Container Ends

        return HTML
    }
}