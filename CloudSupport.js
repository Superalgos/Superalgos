
/*

This module is for enabling the AACloud to run at the browser.

When running at the clode on NodeJS some things work diffently that at the browser. That gap will be fixed by the functions at this module.

*/

function runBot() {

    let root = newRoot();

    root.initialize();
    root.start();

}

function webRequire(pModulePath) {


    if (pModulePath === '') {


    }

}

function downloadModule(pPath) {

    /*  We will need this to load individual bots modules. */

    Requirejs(["Scripts/DummyWeb"], function (DummyWeb) {
        console.log("Dummy Web Loaded");
    });

}