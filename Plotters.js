

function getNewPlotter(pDevTeam, pRepo, pModule) {

    let plotter;
    let fullCode = pDevTeam + pRepo + pModule;
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


            