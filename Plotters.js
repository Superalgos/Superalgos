

function getNewPlotter(pDevTeamOrHost, pRepo, pModule) {

    let plotter;
    let fullCode = pDevTeamOrHost + pRepo + pModule;
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


            