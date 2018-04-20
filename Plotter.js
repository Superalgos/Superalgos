

function getNewPlotter(pDevTeamOrHost, pPlotter, pModule) {

    let plotter;
    let fullCode = pDevTeamOrHost + pPlotter + pModule;
    fullCode = fullCode.replace(/-/g, "");

    switch (fullCode) {

// Cases 

        default:
            {
                throw("getNewPlotter: " + fullCode + " not found.")
            }
    }

    return plotter;
}


            