const {info, warn} = require('./Exports/Docs/Scripts/Logger').logger
const yargs = require('yargs/yargs')
const {hideBin} = require('yargs/helpers')

const argv = yargs(hideBin(process.argv))
    .option('local-directory', {
        alias: 'l',
        type: 'string',
        description: 'The local directory where the files will be written, defaults to "My-Data-Storage/_site"',
        default: 'My-Data-Storage/_site'
    })
    .option('remote-directory', {
        alias: 'r',
        type: 'string',
        description: 'The remote directory where the files will be served from, defaults to "My-Data-Storage/_site"',
        default: 'My-Data-Storage/_site'
    })
    .option('bots', {
        alias: 'b',
        type: 'boolean',
        description: 'If this is flagged then the robots.txt file not will be created',
    })
    .option('sthml', {
        type: 'boolean',
        description: 'Does the output need to be in the \'shtml\' format?'
    })
    .parse()

runRoot()

async function runRoot() {
    const EXPORT_DOCS_DIR = './Exports/Docs'

    /*
    Setting up external dependencies.
    */
    global.SA = {
        projects: {
            foundations: {
                utilities: {
                    filesAndDirectories: require('./Projects/Foundations/SA/Utilities/FilesAndDirectories').newFoundationsUtilitiesFilesAndDirectories(),
                    icons: require('./Projects/Foundations/SA/Utilities/Icons').newFoundationsUtilitiesIcons()
                },
                globals: {
                    schemas: {
                        APP_SCHEMA_MAP: new Map()
                    }
                }
            }
        },
        nodeModules: {
            fs: require('fs'),
            util: require('util'),
            path: require('path'),
            jsDom: require('jsdom').JSDOM
        }
    }

    global.ED = {
        DEFAULT_LANGUAGE: 'EN',
        menuLabelsMap: new Map(),
        schemas: require(EXPORT_DOCS_DIR + '/Scripts/SchemaGeneration').schemaGeneration(),
        utilities: require(EXPORT_DOCS_DIR + '/Scripts/DocumentationGenerationUtilities').documentGenerationUtilities(),
        designSpace: require(EXPORT_DOCS_DIR + '/Scripts/DocumentationDesignSpace').documentationDesignSpace(),
        strings: require(EXPORT_DOCS_DIR + '/Scripts/DocumentationStringsUtilities').documentationStringsUtilities(),
        pageGlobals: require(EXPORT_DOCS_DIR + '/Scripts/DocumentationPageGlobals').documentationPageGlobals(),
        indexFile: EXPORT_DOCS_DIR + '/index.html',
        baseIndexFile: EXPORT_DOCS_DIR + '/index_base.html',
        siteIndexData: require(EXPORT_DOCS_DIR + '/site-index.json'),
        searchJs: EXPORT_DOCS_DIR + '/js/search.js',
        asShtml: argv.shtml
    }


    /* Load Environment Variables */
    let ENVIRONMENT = require('./Environment.js')
    let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
    global.env = ENVIRONMENT_MODULE
    global.env.EXPORT_DOCS_DIR = EXPORT_DOCS_DIR

    // Set the override values
    global.env.PATH_TO_PAGES_DIR = argv.l

    let tempRoute = '/'
    if(argv.r.length > 0) {
        if(argv.r.startsWith('/')) {
            tempRoute = argv.r
        } else {
            tempRoute += argv.r
        }
        if(!argv.r.endsWith('/') ) {
            tempRoute += '/'
        }
    }
    global.env.REMOTE_DOCS_DIR = tempRoute

    /*
    First thing is to load the project schema file.
    */
    global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)

    /*
    Version Management
    */
    SA.version = require('./package.json').version

    const projectSchemaNames = global.PROJECTS_SCHEMA
        .map(project => project.name)
        .sort()
    const categories = ED.schemas.schemaTypes
        .map(t => t.category)
        .sort()

    info('Source files'.padEnd(20) + ' -> preparing index template')
    setSourceFileLinks()

    global.SCHEMAS_BY_PROJECT = new Map()
    for(let i = 0; i < projectSchemaNames.length; i++) {
        const schemas = await ED.schemas.convertProjectsToSchemas(projectSchemaNames[i])
        global.SCHEMAS_BY_PROJECT.set(projectSchemaNames[i], schemas)
    }

    global.PROJECT_ICONS = {
        byName: new Map(),
        byType: new Map()
    }

    for(let i = 0; i < projectSchemaNames.length; i++) {
        await ED.designSpace.initialize(projectSchemaNames[i])
    }

    const results = []
    for(let i = 0; i < projectSchemaNames.length; i++) {
        await ED.designSpace.copyProjectAssets(projectSchemaNames[i])
        for(let j = 0; j < categories.length; j++) {
            const result = await run({
                project: projectSchemaNames[i],
                category: categories[j]
            })
            info(result.log)
            results.push({
                count: result.count,
                project: result.project,
                category: result.category
            })
        }
    }
    total = results.reduce((t, r) => t + r.count, 0)
    info('Built ' + total + ' page' + (total != 1 ? 's' : ''))

    await ED.designSpace.copyWebServerData()
    await ED.designSpace.copyCustomJsScripts()
    await ED.designSpace.copyCustomCssScripts()
    await ED.designSpace.copyFavicon()

    buildIndexPage()

    info('SearchEngine'.padEnd(20) + ' -> starting search engine indexing')
    require('./Exports/Docs/Scripts/SearchEngine').docsSearchEngine().setUpSearchEngine()
    info('SearchEngine'.padEnd(20) + ' -> completed search engine indexing')


    if(!argv.bots) {
        const robots = `User-agent: *\nDisallow: /`
        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_PAGES_DIR + '/robots.txt', robots)
    }

    /**
     * @param {{project: string, category: string}}
     */
    async function run(projectCategory) {
        const app = require(EXPORT_DOCS_DIR + '/ExportDocumentationApp.js').newExportDocumentationApp()

        info('Exporting'.padEnd(20) + ' -> ' + projectCategory.project + ' -> ' + projectCategory.category)
        const count = await ED.schemas.convertProjectsToSchemas(projectCategory.project)
            .then(() => setUpMenuItemsMap(projectCategory.project))
            .then(() => app.run(projectCategory))

        return {
            log: 'Exported'.padEnd(20) + ' -> ' + projectCategory.project + ' -> ' + projectCategory.category + ' completed ' + count + ' docs',
            count,
            project: projectCategory.project,
            category: projectCategory.category
        }

        function setUpMenuItemsMap(project) {
            info('Menu items'.padEnd(20) + ' -> iterating schema project map')
            /*
            Here we will put put all the menu item labels of all nodes at all
            app schemas into a single map, that will allow us to know when a phrase
            is a label of a menu and then change its style.
            */
            let appSchemaArray = global.SCHEMAS_BY_PROJECT.get(project).array.appSchema

            for(let j = 0; j < appSchemaArray.length; j++) {
                const docsSchemaDocument = appSchemaArray[j]

                if(docsSchemaDocument.menuItems === undefined) {continue}
                for(let k = 0; k < docsSchemaDocument.menuItems.length; k++) {
                    const menuItem = docsSchemaDocument.menuItems[k]
                    ED.menuLabelsMap.set(menuItem.label, true)
                }
            }
        }
    }

    /**
     * Renders an index page
     */
    function buildIndexPage() {
        let html = '<div class="docs-home">'
        html += '<div class="docs-index-page docs-font-normal">' + ED.siteIndexData.notes + '</div>'
        const destination = global.env.PATH_TO_PAGES_DIR + '/index.html'
        try {
            const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.indexFile))
            dom.window.document.getElementById('docs-content-div').innerHTML = html
            ED.pageGlobals.addNavigation(dom.window.document, 'index.html', [ED.DEFAULT_LANGUAGE])
            ED.pageGlobals.addSearch(dom.window.document)
            ED.pageGlobals.addFooter(dom.window.document)
            SA.nodeModules.fs.writeFileSync(destination, dom.serialize())
        }
        catch(error) {
            console.error(error)
        }
    }

    function setSourceFileLinks() {
        const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.baseIndexFile))

        const favicon = dom.window.document.createElement('link')
        favicon.type = 'image/x-icon'
        favicon.rel = 'icon'
        favicon.href = global.env.REMOTE_DOCS_DIR + 'favicon.ico'
        dom.window.document.getElementsByTagName('head')[0].appendChild(favicon)

        const main = dom.window.document.createElement('link')
        main.type = 'text/css'
        main.rel = 'stylesheet'
        main.href = global.env.REMOTE_DOCS_DIR + 'css/main.css'
        dom.window.document.getElementsByTagName('head')[0].appendChild(main)

        const docs = dom.window.document.createElement('link')
        docs.type = 'text/css'
        docs.rel = 'stylesheet'
        docs.href = global.env.REMOTE_DOCS_DIR + 'css/docs.css'
        dom.window.document.getElementsByTagName('head')[0].appendChild(docs)

        const docsStatic = dom.window.document.createElement('link')
        docsStatic.type = 'text/css'
        docsStatic.rel = 'stylesheet'
        docsStatic.href = global.env.REMOTE_DOCS_DIR + 'css/docs-static.css'
        dom.window.document.getElementsByTagName('head')[0].appendChild(docsStatic)

        const fonts = dom.window.document.createElement('link')
        fonts.type = 'text/css'
        fonts.rel = 'stylesheet'
        fonts.href = global.env.REMOTE_DOCS_DIR + 'css/font-awasome.css'
        dom.window.document.getElementsByTagName('head')[0].appendChild(fonts)

        // adding this to the bottom of the <body> as not sure if jsdom supports `defer` tag
        const actionScripts = dom.window.document.createElement('script')
        actionScripts.type = 'text/javascript'
        actionScripts.src = global.env.REMOTE_DOCS_DIR + 'js/action-scripts.js'
        dom.window.document.getElementsByTagName('body')[0].appendChild(actionScripts)

        const flexSearch = dom.window.document.createElement('script')
        flexSearch.type = 'text/javascript'
        flexSearch.src = global.env.REMOTE_DOCS_DIR + 'js/flexsearch.bundle.js'
        dom.window.document.getElementsByTagName('body')[0].appendChild(flexSearch)

        const search = dom.window.document.createElement('script')
        search.type = 'text/javascript'
        search.src = global.env.REMOTE_DOCS_DIR + 'js/search.js'
        dom.window.document.getElementsByTagName('body')[0].appendChild(search)

        SA.nodeModules.fs.writeFileSync(ED.indexFile, dom.serialize())
    }
}
