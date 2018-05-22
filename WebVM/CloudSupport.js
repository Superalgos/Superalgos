
/*

This module is for enabling the AACloud to run at the browser.

When running at the clode on NodeJS some things work diffently that at the browser. That gap will be fixed by the functions at this module.

*/



function runBot() {

    window.CURRENT_ENVIRONMENT = "Develop"; 
    window.STORAGE_PERMISSIONS = ecosystem.getStoragePermissions();
    window.EXCHANGE_KEYS = ecosystem.getExchangeKeys();

    let root = newRoot();

    root.initialize();
    root.start();

}

function webRequire(pModulePath) {

    switch (pModulePath) {

        case 'fs': {

            return newWebFS();
        }
    }
}

function downloadModule(pPath) {

    /*  We will need this to load individual bots modules. */

    Requirejs(["Scripts/DummyWeb"], function (DummyWeb) {
        console.log("Dummy Web Loaded");
    });

}


