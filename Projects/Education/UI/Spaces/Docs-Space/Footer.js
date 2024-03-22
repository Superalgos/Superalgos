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

        if(GLOBAL.LANGUAGES !== undefined && GLOBAL.LANGUAGES.length > 0) {
            let languageCode = UI.projects.education.spaces.docsSpace.language
            HTML = HTML + '<div class="docs-footer-cell">'

            HTML = HTML + '<h4>Choose Your Language</h4>'
            HTML = HTML + 'Click on your preferred language:<br/>'
            
            for(let i = 0; i < GLOBAL.LANGUAGES.length; i++) {
                let lang = GLOBAL.LANGUAGES[i]
                HTML = HTML + '<a href="#" onClick="UI.projects.education.spaces.docsSpace.changeLanguage(\'' + lang.code + '\')"><img src="Images/Languages/' + lang.code + '.png" title="' + lang.title + '" class="docs-footer-language'
                if (languageCode === lang.code) { 
                    HTML = HTML + '-selected'
                } 
                HTML = HTML + '"></a>'
            }
            HTML = HTML + '</div>'
        }

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
        HTML = HTML + '<li><a href="https://t.me/superalgos_de" target="_blank">German</a></li>'
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
