const {info, warn} = require('./Exports/Docs/Scripts/Logger').logger
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
        indexFile: EXPORT_DOCS_DIR + '/index.html',
        baseIndexFile: EXPORT_DOCS_DIR + '/index_base.html'
    }


    /* Load Environment Variables */
    let ENVIRONMENT = require('./Environment.js')
    let ENVIRONMENT_MODULE = ENVIRONMENT.newEnvironment()
    global.env = ENVIRONMENT_MODULE
    global.env.EXPORT_DOCS_DIR = EXPORT_DOCS_DIR

    if(process.argv.length > 2) {
        global.env.PATH_TO_PAGES_DIR = process.argv[2]
        global.env.REMOTE_DOCS_DIR = process.argv[3] || process.argv[2]
    }

    /*
    First thing is to load the project schema file.
    */
    global.PROJECTS_SCHEMA = require(global.env.PATH_TO_PROJECT_SCHEMA)

    /*
    Version Management
    */
    SA.version = require('./package.json').version

    let projectSchemaNames = global.PROJECTS_SCHEMA.map(project => project.name).sort()
    const categories = ED.schemas.schemaTypes.map(t => t.category).sort()

    const results = []
    for(let i = 0; i < projectSchemaNames.length; i++) {
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

    buildIndexPage(projectSchemaNames, categories, results)

    const robots = `User-agent: *\nDisallow: /`
    SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_PAGES_DIR + '/robots.txt', robots)

    /**
     * @param {{project: string, category: string}}
     */
    async function run(projectCategory) {
        global.SCHEMAS_BY_PROJECT = new Map()
        ED.app = require(EXPORT_DOCS_DIR + '/ExportDocumentationApp.js').newExportDocumentationApp()
        info('Superalgos documentation ' + projectCategory.project + '/' + projectCategory.category + ' is exporting!')
        const count = await ED.app.run(projectCategory)
        return {
            log: 'Superalgos documentation ' + projectCategory.project + '/' + projectCategory.category + ' has exported ' + count + ' docs',
            count,
            project: projectCategory.project,
            category: projectCategory.category
        }
    }

    /**
     * @param {string} project
     * @param {string[]} categories
     * @param {{
     *    count: number,
     *    project: string,
     *    category: string
     *  }[]} results
     */
    function buildIndexPage(projects, categories, results) {
        let html = '<div>'
        for(let i = 0; i < projects.length; i++) {
            html += '<div class="docs-definition-floating-cells"><h3>' + projects[i] + '</h3>'
            for(let j = 0; j < categories.length; j++) {
                if(results.find(r => r.project == projects[i] && r.category == categories[j]).count > 0) {
                    html += '<div class="docs-definition-floating-links"><a href="' + projects[i] + '/' + categories[j] + '/index.html">' + categories[j] + '</a></div>'
                }
                else {
                    html += '<div class="docs-definition-floating-links">' + categories[j] + '</div>'
                }
            }
            html += '</div>'
        }
        html += '</div>'

        const destination = global.env.PATH_TO_PAGES_DIR + '/index.html'
        try {
            const dom = new SA.nodeModules.jsDom(SA.nodeModules.fs.readFileSync(ED.indexFile))
            dom.window.document.getElementById('docs-content-div').innerHTML = html
            SA.nodeModules.fs.writeFileSync(destination, dom.serialize())
        }
        catch(error) {
            console.error(error)
        }
    }
}