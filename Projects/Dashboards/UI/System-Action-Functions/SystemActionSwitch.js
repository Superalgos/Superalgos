function newDashboardsSystemActionSwitch() {
    let thisObject = {
        name: 'newDashboardsSystemActionSwitch',
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    };

    return thisObject;

    function finalize() {
        // No specific finalization actions required.
    }

    function initialize() {
        // Nothing to initialize since a Function Library does not hold any state.
    }

    async function executeAction(action) {
        switch (action.name) {
            case 'runDashboards':
                {
                    // Dynamically construct the URL based on the current window's location
                    const protocol = window.location.protocol;
                    const hostname = window.location.hostname; // This will handle both localhost and the external IP
                    const port = 34248;
                    const url = `${protocol}//${hostname}:${port}/Launch-Dashboards`;
    
                    let options = {
                        method: 'GET'
                    }
    
                    // Sending the HTTP request using fetch API.
                    try {
                        await fetch(url, options)
                            .then(response => response.json())
                            .then(json => {
                                if (json.result === 'Success') {
                                    console.log(`[INFO] Dashboards launched successfully.`);
                                } else {
                                    console.error(`[ERROR] Failed to launch dashboards: ${json.error}`);
                                }
                            });
                    } catch (err) {
                        console.error(`[ERROR] Error in making request to launch dashboards: ${err.message}`);
                    }
                }
                break;
            default: {
                console.log(`[WARN] Action sent to Dashboards System Action Switch does not belong here. -> Action = ${action.name}`);
            }
        }
    }    
}
