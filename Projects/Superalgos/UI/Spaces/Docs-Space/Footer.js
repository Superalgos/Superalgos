function newSuperalgosDocsFooter() {
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
        let languageLabel = UI.projects.superalgos.utilities.languages.getLaguageLabel(UI.projects.superalgos.spaces.docsSpace.language)

        let HTML = ''

        HTML = HTML + '<div id="docs-footer" class="docs-node-html-footer-container">' // Container Starts

        // Language Section

        HTML = HTML + '<div class="docs-node-html-footer-table">'

        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell" style="white-space: nowrap; overflow-x: auto; ">'
        HTML = HTML + '<h3 style="display: inline-block;">Help Superalgos Speak Your Language!</h3>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell style="white-space: nowrap; overflow-x: auto;" >' // white-space: nowrap; overflow-x: auto; prevents line breaks when combined with display: inline-block;" in the child elements
        HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.superalgos.spaces.docsSpace.scrollToElement(\'docs-space-div\')"><button>TO TOP</button></span>'
        if (UI.projects.superalgos.spaces.docsSpace.previousDocumentBeingRendered !== undefined ) {
            HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'' + UI.projects.superalgos.spaces.docsSpace.previousDocumentBeingRendered.project + '\', \'' + UI.projects.superalgos.spaces.docsSpace.previousDocumentBeingRendered.category + '\', \'' + UI.projects.superalgos.spaces.docsSpace.previousDocumentBeingRendered.type + '\')"><button>BACK</button></span>'        
        }
        if (UI.projects.superalgos.spaces.docsSpace.currentBookBeingRendered !== undefined ) {
            HTML = HTML + '<span style="float: right; display: inline-block;" onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'' + UI.projects.superalgos.spaces.docsSpace.currentBookBeingRendered.project + '\', \'' + UI.projects.superalgos.spaces.docsSpace.currentBookBeingRendered.category + '\', \'' + UI.projects.superalgos.spaces.docsSpace.currentBookBeingRendered.type + '\')"><button>TO BOOK</button></span>'        
        }
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'

        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-node-html-footer-table">'

        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Multi-language Docs</h4>'
        HTML = HTML + 'We produce the original documentation in English and you get the content in your preferred language only when translations are available. When not, you get the default content, in English.'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Choose Your Language</h4>'
        HTML = HTML + 'The current preferred language is <strong>' + languageLabel + '</strong>. Switch to:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'EN\')">English</a></li>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'ES\')">Spanish</a></li>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'RU\')">Russian</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Contribute Translations</h4>'
        HTML = HTML + '<strong>1. </strong>Switch to your language.<br/>'
        HTML = HTML + '<strong>2. </strong>Edit any English content (title, paragraph, etc.) with your translation.<br/>'
        HTML = HTML + '<strong>3. </strong>Save changes typing <code class="docs-footer-code">docs.save</code> in the search/command box.<br/>'
        HTML = HTML + '<strong>4. </strong>Type <code class="docs-footer-code">app.contribute</code> to update your fork and submit a PR.<br/>'
        HTML = HTML + '</ol>'
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
        HTML = HTML + 'Superalgos may run from different branches in the repository. The <code class="docs-footer-code">master</code> branch features the stable version, and the <code class="docs-footer-code">develop</code> branch the version in development.'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Choose the Active Branch</h4>'
        HTML = HTML + 'You are currently running on the <code class="docs-footer-code">' + languageLabel + '</code> branch. Switch to:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'EN\')"><code class="docs-footer-code">English</code></a></li>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'ES\')"><code class="docs-footer-code">Spanish</a></code></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Contributions Branch</h4>'
        HTML = HTML + 'You are currently contributing to the <code class="docs-footer-code">' + languageLabel + '</code> branch. Switch to:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'EN\')"><code class="docs-footer-code">English</code></a></li>'
        HTML = HTML + '<li><a href="#" onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'ES\')"><code class="docs-footer-code">Spanish</a></code></li>'
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
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://t.me/superalgoscommunity" target="_blank">Community Group</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgossupport" target="_blank">Technical Support Group</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosdevelop" target="_blank">Developers Group</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosuxui" target="_blank">UX/UI Design Group</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>In Your Language</h4>'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://t.me/superalgos_es" target="_blank">Hablemos en Español!</a></li>'
        HTML = HTML + '<li><a href="https://t.me/superalgos_ru" target="_blank">Говорим по русски!</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Other Resources</h4>'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://t.me/superalgos" target="_blank">Official Announcements</a></li>'
        HTML = HTML + '<li><a href="https://superalgos.org" target="_blank">Features and Functionality</a></li>'
        HTML = HTML + '<li><a href="https://github.com/Superalgos/Superalgos" target="_blank">Main Repository</a></li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<img src="Images/superalgos-logo-white.png" width="200 px">'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>' // Container Ends

        return HTML
    }
}