function getNewPlotterPanel(pDataMineOrHost, pPlotter, pModule, pPanel) {
    let functionName = pDataMineOrHost + pPlotter + pModule + pPanel;
    functionName = functionName.replace(/-/g, "");
    functionName = 'new' + functionName
    return window[functionName]();
}
