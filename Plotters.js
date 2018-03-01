

function getNewPlotter(pDevTeam, pRepo, pModule) {

    let plotter;
    let fullCode = pDevTeam + pRepo + pModule;

    switch (fullCode) {

// Cases 

        default:
            {
                throw("getNewPlotter: " + fullCode + " not found.")
            }
    }

    return plotter;
}


            