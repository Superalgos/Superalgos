const { runPlatform } = require('./Launch-Scripts/runPlatform')
const { runFirstDashboards } = require('./Launch-Scripts/runDashboards')


if(process.argv.includes("dashboards")){
    runFirstDashboards(()=>runPlatform())
}
else{
    runPlatform()
}
