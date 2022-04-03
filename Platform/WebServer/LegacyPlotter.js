function getNewPlotter(pDataMineOrHost, pPlotter, pModule) {
    let functionName = pDataMineOrHost + pPlotter + pModule;
    functionName = functionName.replace(/-/g, "");
    functionName = 'new' + functionName
    return window[functionName]();
}
