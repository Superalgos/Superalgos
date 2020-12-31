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

        HTML = HTML + '<div class="docs-node-html-footer-container">' // Container Starts

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<div onClick="UI.projects.superalgos.spaces.docsSpace.scrollToElement(\'docs-space-div\')" class="docs-plain-link"><kbd class=docs-kbd>BACK TO TOP ↑</kbd></div>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + 'You are currently reading the Docs in ' + languageLabel + '. To read the Docs in your language, follow one of these links:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'EN\')" class="docs-footer-link">English</a> — The collection of articles is complete in this language.</li>'
        HTML = HTML + '<li><a onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'ES\')" class="docs-footer-link">Spanish</a> — Work in progress. You are invited to contribute translating content.</li>'
        HTML = HTML + '<li><a onClick="UI.projects.superalgos.spaces.docsSpace.changeLanguage(\'RU\')" class="docs-footer-link">Russian</a> — Work in progress. You are invited to contribute translating content.</li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + 'Other resources:'
        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://superalgos.org/" target="_blank" class="docs-footer-link">Superalgos Project</a> — Learn more about the project.</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgoscommunity" rel="nofollow" target="_blank" class="docs-footer-link">Community Group</a> — Lets talk Superalgos!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgossupport" rel="nofollow" target="_blank" class="docs-footer-link">Support Group</a> — Need help using the <code >master</code> branch?</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosdevelop" rel="nofollow" target="_blank" class="docs-footer-link">Develop Group</a> — Come test the <code class="docs-code">develop</code> branch!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosuxui" rel="nofollow" target="_blank" class="docs-footer-link">UX/UI Design Group</a> — Help us improve the GIU!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgos_es" rel="nofollow" target="_blank" class="docs-footer-link">Grupo en Español</a> — Hablemos en español!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgos" rel="nofollow" target="_blank" class="docs-footer-link">Superalgos Announcements</a> — Be the first to know about new releases, hotfixes, and important issues.</li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '<img src="Images/superalgos-logo-white.png" width="200 px">'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>' // Container Ends

        return HTML
    }
}