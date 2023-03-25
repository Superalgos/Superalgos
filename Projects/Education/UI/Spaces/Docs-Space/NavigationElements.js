function newFoundationsDocsNavigationElements() {
    let thisObject = {
        getTopNavPanel: getTopNavPanel,
        getRightNavPanel: getRightNavPanel,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
    }

    function finalize() {
    }

    function getTopNavPanel() {
        let HTML = ''
        HTML = HTML + '<div class="docs-navigation-elements-top-table">'
        HTML = HTML +   '<div class="docs-navigation-elements-top-table-body">'
        HTML = HTML +     '<div class="docs-navigation-elements-top-table-row">'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'User Manual' + '\')"><button>USER MANUAL</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'First Steps Tutorials' + '\')"><button>TUTORIALS</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'Community Data Mines' + '\')"><button>DATA MINES</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Governance' + '\', \'' + 'Book' + '\', \'' + 'The Governance Project' + '\')"><button>GOVERNANCE</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'UsersAMPERSAND Formula and Code Examples' + '\')"><button>EXAMPLES</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'Community Themes' + '\')"><button>THEMES</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'The Docs Explained' + '\')"><button>DOCS</button></span></div>'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: center; display: inline-block;" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + 'Foundations' + '\', \'' + 'Book' + '\', \'' + 'Reviews' + '\')"><button>REVIEWS</button></span></div>'
        HTML = HTML +     '</div>'
        HTML = HTML +   '</div>'
        HTML = HTML + '</div>'
        return HTML
    }

    function getRightNavPanel() {
        let HTML = ''
        HTML = HTML + '<div id="docs-navigation-elements-sidebar-div" class="docs-navigation-elements-sidebar" style="display: inline;">'
        HTML = HTML +   '<div class="docs-navigation-elements-right-table">'
        HTML = HTML +     '<div class="docs-navigation-elements-right-table-body">'
        HTML = HTML +       '<div class="docs-navigation-elements-right-table-row">'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: left; display: inline;"><button id="docs-navigation-go-back-btn" onClick="UI.projects.education.spaces.docsSpace.navigateBack()" title="Go Back" disabled><img src=Icons/Foundations/Arrow/arrow-orange-left.png></button></span></div>'
        HTML = HTML +       '</div>'
        HTML = HTML +       '<div class="docs-navigation-elements-right-table-row">'
        HTML = HTML +       '<div class="docs-navigation-elements-top-table-cell"><span style="float: right; display: inline;"><button id="docs-navigation-go-forward-btn" onClick="UI.projects.education.spaces.docsSpace.navigateForward()" title="Go Forward" disabled><img src=Icons/Foundations/Arrow/arrow-orange-right.png></button></span></div>'
        HTML = HTML +       '</div>'
        HTML = HTML +       '<div class="docs-navigation-elements-right-table-row">'
        HTML = HTML +         '<div class="docs-navigation-elements-right-table-cell"><span style="float: right; display: inline;"><button id="docs-navigation-to-top-btn" onclick="UI.projects.education.spaces.docsSpace.scrollToElement(\'docs-space-div\')" title="Go to top" disabled><img src=Icons/Foundations/Arrow/arrow-orange-up.png></button></span></div>'
        HTML = HTML +       '</div>'
        HTML = HTML +       '<div class="docs-navigation-elements-right-table-row">'
        HTML = HTML +         '<div class="docs-navigation-elements-right-table-cell"><span style="float: right; display: inline;"><button id="docs-navigation-to-bottom-btn" onclick="UI.projects.education.spaces.docsSpace.scrollToElement(\'docs-footer\')" title="Go to footer"><img src=Icons/Foundations/Arrow/arrow-orange-down.png></button></span></div>'
        HTML = HTML +       '</div>'
        HTML = HTML +       '<div class="docs-navigation-elements-right-table-row">'
        HTML = HTML +         '<div class="docs-navigation-elements-right-table-cell" style="float: left;"><span style="float: left; display: inline;"><button id="docs-navigation-share-btn" onClick="UI.projects.education.spaces.docsSpace.sharePage()" title="Copy path to current page" disabled><img src=Icons/Foundations/share-icon.png></button></span></div>'
        HTML = HTML +       '</div>'
        HTML = HTML +       '<div class="docs-navigation-elements-right-table-row">'
        HTML = HTML +         '<div class="docs-navigation-elements-right-table-cell" style="float: left;"><span style="float: left; display: inline;"><button id="docs-navigation-to-book-btn" onClick="" title="Go to book with current topic" disabled><img src=Icons/Foundations/to-book-icon.png></button></span></div>'
        HTML = HTML +       '</div>'
        HTML = HTML +     '</div>'
        HTML = HTML +   '</div>'
        HTML = HTML +   '<div id="docs-navigation-elements-sidebar-circle-div" class="docs-navigation-elements-sidebar-circle" onclick="UI.projects.education.spaces.docsSpace.toggleRightNavPanel()">'
        HTML = HTML +     '<i id="docs-navigation-elements-sidebar-circle-left" class="fa fa-chevron-left"></i>'
        HTML = HTML +     '<i id="docs-navigation-elements-sidebar-circle-right"class="fa fa-chevron-right" style="display: none;"></i>'
        HTML = HTML +   '</div>'
        HTML = HTML + '</div>'
        return HTML
    }
}