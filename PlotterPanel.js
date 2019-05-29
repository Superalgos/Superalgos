function getNewPlotterPanel(pDevTeamOrHost, pPlotter, pModule, pPanel) {
    let functionName = pDevTeamOrHost + pPlotter + pModule + pPanel;
    functionName = functionName.replace(/-/g, "");
    functionName = 'new' + functionName
    return window[functionName]();
}
