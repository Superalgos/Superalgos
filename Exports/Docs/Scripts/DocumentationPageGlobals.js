const {info, warn, error} = require('./Logger').logger
exports.documentationPageGlobals = function documentationPageGlobals() {
    let thisObject = {
        addFooter: addFooter,
        addNavigation: addNavigation,
        addSearch: addSearch,
        buildPage: buildPage
    }

    // Should read this from JSON config
    const languagePack = {
        'EN': 'English',
        'ES': 'Spanish',
        'RU': 'Russian',
        'IT': 'Italian',
        'DE': 'German',
        'FR': 'French',
        'CN': 'Simplified Chinese-Mandarin',
        'ID': 'Bahasa',
        'TR': 'Turkish',
        'NL': 'Dutch',
        'AR': 'Arabic',
        'EL': 'Greek'
    }

    return thisObject

    /**
     * Builds out page navigation objects
     * @param {Page} page 
     * @param {number} depth
     * @param {string?} currentDocumentLink
     * @return {string}
     */
     function buildPage(page, depth, currentDocumentLink) {
        if(!page.active) {return ''}

        let html = '<div class="docs-page-link depth-' + depth + '">'
        if(depth == 0) {
            // html += '<h3>' + page.title + '</h3>'
        }
        else {
            const classList = ['button']
            if(currentDocumentLink !== undefined && page.link.join('/').indexOf(currentDocumentLink) >= 0) {
                classList.push('active')
            }
            html += '<a href="'+ ED.utilities.normaliseInternalLink(page.link) + '" class="' + classList.join(' ') + '">' + page.title + '</a>'
        }
        if(page.children!== undefined && page.children.length>0) {
            let nextDepth = depth + 1
            for(let i =0; i < page.children.length; i++) {
                html += buildPage(page.children[i], nextDepth, currentDocumentLink)
            }
        }
        return html + '</div>'
    }

    function addFooter(document) {

        let HTML = ''

        HTML = HTML + '<div class="docs-page">'
        HTML = HTML + '<div id="docs-footer" class="docs-node-html-footer-container">' // Container Starts

        // Buttons Section

        HTML = HTML + '<div class="docs-node-html-footer-table">'
        HTML = HTML + '<div class="docs-footer-row">'

        HTML = HTML + '<div class="docs-footer-cell" style="white-space: nowrap; overflow-x: auto;" >' // white-space: nowrap; overflow-x: auto; prevents line breaks when combined with display: inline-block;" in the child elements

        // TODO: update sharing
        HTML = HTML + '<span style="float: right; display: inline-block;" id="docs-sharePage"><button>SHARE</button></span>'
        
        // TODO: update scroll to top
        HTML = HTML + '<span style="float: right; display: inline-block;" id="docs-scrollToElement"><button>TO TOP</button></span>'

        HTML = HTML + generateFooterBookLink('Foundations', 'Book', 'Reviews', 'REVIEWS')
        HTML = HTML + generateFooterBookLink('Foundations', 'Book', 'Community Data Mines', 'DATA MINES')
        HTML = HTML + generateFooterBookLink('Foundations', 'Book', 'First Steps Tutorials', 'TUTORIALS')
        HTML = HTML + generateFooterBookLink('Foundations', 'Book', 'User Manual', 'USER MANUAL')

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

        HTML = HTML + '<div class="docs-footer-cell">'
        HTML = HTML + '<h4>Contribute Translations</h4>'
        HTML = HTML + 'Earn tokens by helping translate the Docs and tutorials to your native language! Search the Docs for How to Contribute Translations and join the Superalgos Docs Group to coordinate with other contributors...'
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
        HTML = HTML + '<img src="' + ED.utilities.normaliseInternalLink(['Images', 'superalgos-logo-white.png']) + '" width="200 px">'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'
        
        HTML = HTML + '</div>' // Container Ends
        HTML = HTML + '</div>'

        document.getElementById('docs-footer-div').innerHTML = HTML

        function generateFooterBookLink(project, category, pageType, content) {
            const link = ED.utilities.normaliseInternalLink([project, category, ED.utilities.normaliseStringForLink(pageType)])
            return '<a class="button" style="float: right; display: inline-block;" href="' + link + '">' + content + ' </a>'
        }
    }

    /**
     * 
     * @param {*} document
     * @param {string?} currentDocumentLink
     */
    function addNavigation(document, currentDocumentLink, languages) {
        let html = '<div class="docs-page">'
        html += '<div class="docs-nav">'
        html += buildPage(ED.siteIndexData.page, 0, currentDocumentLink)
        html += '</div>'
        html += addTranslationIcons()
        html += '</div>'
        document.getElementById('docs-nav-div').innerHTML = html

        /**
             * Builds the list of available translations from the class list that is created while writing out the content
             */
         function addTranslationIcons() {
            let html = '<div id="docs-translation-list" class="dropdown">'
            html = html + '<span class="docs-tooltip" data-tippy-content="This is a community project and not all sections will have been translated, this is where you can help and earn rewards!">Available translations</span>'
            html = html + '<div class="dropdown-content">'
            for(let i = 0; i < languages.length; i++) {
                const key = languages[i]
                const value = languagePack[key]
                if(value === undefined) {
                    error('Translation'.padEnd(20) + ' -> Missing language option for translation')
                    html = html + buildTranslationIconHtml(key, value)
                    continue
                }
                html = html + buildTranslationIconHtml(key, value)
            }
            html = html + '</div>'
            return html + '</div>'

            function buildTranslationIconHtml(key, value) {
                return '<span class="translation-options" language="' + key + '"><img src="' + ED.utilities.normaliseInternalLink(['Images', 'Languages', key + '.png']) + '" title="' + value + '" class="docs-footer-language"/></span>'
            }
        }
    }

    /**
     * Adds the search bar to the HTML document
     * @param {*} document 
     */
    function addSearch(document) {
        let html = '<div class="docs-search-results-header">'
        html += '<div class="docs-image-logo-search-results"><img src="' + ED.utilities.normaliseInternalLink(['Images', 'superalgos-logo.png']) + '" width=200></div>'
        html += '<button id="enable-search">Turn on search</button>'
        html += '<div id="search-input" class="docs-search-results-box hidden">'
        html += '<input class="docs-search-input" placeholder="search the docs" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input>'
        html += '</div>'
        html += '</div>'
        html += '<div id="search-spinner" class="hidden"><i class="fa fa-spinner fa-spin"></i> loading results</div>'
        html += '<div id="docs-search-content-div" class="hidden"></div>'
        document.getElementById('docs-search-results-div').innerHTML = html
    }
}