function getNewPlotter(pDevTeamOrHost, pPlotter, pModule) {
    let functionName = pDevTeamOrHost + pPlotter + pModule;
    functionName = functionName.replace(/-/g, "");
    functionName = 'new' + functionName
    return window[functionName]();
}
