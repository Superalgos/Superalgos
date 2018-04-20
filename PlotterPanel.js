
function getNewPlotterPanel(pDevTeamOrHost, pPlotter, pModule, pPanel) {

    let plotterPanel;
    let fullCode = pDevTeamOrHost + pPlotter + pModule + pPanel;
    fullCode = fullCode.replace(/-/g, "");

    switch (fullCode) {

// Cases 

        default:
            {
                throw ("getNewPlotterPanel: " + fullCode + " not found.")
            }
    }

    return plotterPanel;
}
