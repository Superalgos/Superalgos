exports.newGithub = function newGithub() {

    let thisObject = {
        getGithubData: getGithubData,
        initialize: initialize
    }

    let githubData;

    return thisObject;

    function initialize(pGithubData) {

        githubData = pGithubData;

    }

    function getGithubData(pOrg, pRepo, pPath, callBackFunction) {

        try {

            if (CONSOLE_LOG === true) { console.log("[INFO] Github -> getGithubData -> Entering function."); }

            let cacheVersion = githubData.get(pOrg + '.' + pRepo + '.' + pPath)

            if (cacheVersion !== undefined) {

                if (CONSOLE_LOG === true) { console.log("[INFO] Github -> getGithubData -> " + pOrg + '.' + pRepo + '.' + pPath + " found at cache."); }

                callBackFunction(cacheVersion);

            } else {

                if (CONSOLE_LOG === true) { console.log("[INFO] Github -> getGithubData -> " + pOrg + '.' + pRepo + '.' + pPath + " NOT found at cache."); }

                const octokit = require('@octokit/rest')()
                global.atob = require("atob");

                let owner = pOrg;
                let repo = pRepo;
                let branch = "master";
                let page = 1;
                let per_page = 100;
                let ref = "master";
                let path = pPath;

                octokit.repos.getContent({ owner, repo, path, ref }, onContent);

                function onContent(error, result) {

                    try {

                        if (CONSOLE_LOG === true) { console.log("[INFO] Github -> getGithubData -> onContent -> Entering function."); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Github -> getGithubData -> onContent -> error = " + error); }
                        if (CONSOLE_LOG === true) { console.log("[INFO] Github -> getGithubData -> onContent -> Github.com responded to request " + pOrg + '.' + pRepo + '.' + pPath + " with result = " + result.toString().substring(0, 100)); }

                        if (error !== null) { console.log("[ERROR] Github -> getGithubData -> onContent -> " + error); }

                        let decoded = atob(result.data.content);

                        /*
            
                        This method usually brings up to 3 characters of encoding info at the begining of the JSON string which destroys the JSON format.
                        We will run the following code with the intention to eliminate this problem. 
            
                        */

                        let cleanString = decoded;
                        let jsonTest;

                        try {
                            jsonTest = JSON.parse(cleanString);
                        } catch (err) {
                            cleanString = decoded.substring(1);
                            try {
                                jsonTest = JSON.parse(cleanString);
                            } catch (err) {
                                cleanString = decoded.substring(2);
                                try {
                                    jsonTest = JSON.parse(cleanString);
                                } catch (err) {
                                    cleanString = decoded.substring(3);
                                    try {
                                        jsonTest = JSON.parse(cleanString);
                                    } catch (err) {
                                        console.log("[INFO] Github -> getGithubData -> onContent -> Could not clean the data received -> Data = " + decoded.substring(0, 50));
                                    }
                                }
                            }
                        }

                        githubData.set(pOrg + '.' + pRepo + '.' + pPath, cleanString);

                        callBackFunction(cleanString);

                    } catch (err) {
                        console.log("[ERROR] Github -> getGithubData -> onContent -> err.message = " + err.message);
                        callBackFunction("{}");
                    }
                }
            }

        } catch (err) {
            console.log("[ERROR] Github -> getGithubData -> err.message = " + err.message);
            callBackFunction("{}");
        }
    }
}