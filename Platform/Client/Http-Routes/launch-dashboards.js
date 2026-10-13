exports.newLaunchDashboardsRoute = function newLaunchDashboardsRoute() {
    const thisObject = {
        endpoint: 'Launch-Dashboards',
        command: command
    };

    return thisObject;

    function command(httpRequest, httpResponse) {
        const child_process = require('child_process');

        // Execute the dashboards app
        try {
            child_process.exec('node dashboards minMemo', (error, stdout, stderr) => {
                if (error) {
                    console.error(`[ERROR] Failed to execute the command: ${error.message}`);
                    respondWithError(httpResponse, `[ERROR] ${error.message}`);
                    return;
                }
                if (stderr) {
                    console.error(`[ERROR] Command error output: ${stderr}`);
                    respondWithError(httpResponse, `[ERROR] ${stderr}`);
                    return;
                }

                console.log(`[INFO] Command executed successfully: ${stdout}`);
                respondWithSuccess(httpResponse, `[INFO] Dashboards launched successfully.`);
            });
        } catch (err) {
            console.error('[ERROR] Launch Dashboards:', err);
            respondWithError(httpResponse, 'Failed to launch Dashboards');
        }
    }

    function respondWithError(httpResponse, message) {
        SA.projects.foundations.utilities.httpResponses.respondWithContent(
            JSON.stringify({ result: 'Fail', message }),
            httpResponse
        );
    }

    function respondWithSuccess(httpResponse, message) {
        SA.projects.foundations.utilities.httpResponses.respondWithContent(
            JSON.stringify({ result: 'Success', message }),
            httpResponse
        );
    }
};
