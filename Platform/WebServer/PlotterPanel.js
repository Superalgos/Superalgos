function getNewPlotterPanel(pDataMineOrHost, pPlotter, pModule, pPanel) {
    let functionName = pDataMineOrHost + pPlotter + pModule + pPanel;
    functionName = functionName.replace(/-/g, "");
    functionName = 'new' + functionName
    try {
        return window[functionName]();
    } catch (err) {
        console.log((new Date()).toISOString(), '[ERROR] getNewPlotterPanel -> Error trying to Load a Plotter Panel.  err = ' + err.stack)
        console.log((new Date()).toISOString(), '[ERROR] getNewPlotterPanel -> functionName = ' + functionName)
    }
}
