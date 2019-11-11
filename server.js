/* Callbacks default responses. */

global.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

global.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

global.DEFAULT_RETRY_RESPONSE = {
    result: "Retry",
    message: "Retry Later"
};

global.CUSTOM_OK_RESPONSE = {
    result: "Ok, but check Message",
    message: "Custom Message"
};

global.CUSTOM_FAIL_RESPONSE = {
    result: "Fail Because",
    message: "Custom Message"
};

/* Process Events */

process.on('uncaughtException', function (err) {
    console.log('[ERROR] Task Server -> server -> uncaughtException -> err.message = ' + err.message)
    console.log('[ERROR] Task Server -> server -> uncaughtException -> err.stack = ' + err.stack)
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    console.log('[ERROR] Task Server -> server -> unhandledRejection -> reason = ' + JSON.stringify(reason))
    console.log('[ERROR] Task Server -> server -> unhandledRejection -> p = ' + JSON.stringify(p))
    process.exit(1)
})

process.on('exit', function (code) {

    /* We send an event signaling that the Task is being terminated. */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

    global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Stopped') // Meaning Task Stopped
    global.SYSTEM_EVENT_HANDLER.deleteEventHandler(key)
    global.SYSTEM_EVENT_HANDLER.finalize()
    global.SYSTEM_EVENT_HANDLER = undefined

    console.log('[INFO] Task Server -> server -> process.on.exit -> About to exit -> code = ' + code)
})

/*

We read the first string sent as an argument when the process was created by the Task Manager. Ther we will find the information of the identity
of this Task and know exactly what to run within this server instance. 

*/
global.TASK_NODE = process.argv[2]

if (global.TASK_NODE !== undefined) {

    try {
        global.TASK_NODE = JSON.parse(global.TASK_NODE)
        console.log('[INFO] Task Server -> server -> global.TASK_NODE = ' + JSON.stringify(global.TASK_NODE))
    } catch (err) {
        console.log('[ERROR] Task Server -> server -> global.TASK_NODE -> ' + err.stack)
    }

}
else {  // I use this section to debug in standalone mode.
    let argument 
    argument = '{"type":"Task","name":"Generates 1 min to 24 hs Candles & Volumes","bot":{"type":"Indicator Bot Instance","name":"Olivia","code":{"team":"AAMasters","bot":"AAOlivia","repo":"AAOlivia-Indicator-Bot"},"processes":[{"type":"Process Instance","subType":"Indicator Process Instance","name":"Daily","code":{"process":"Multi-Period-Daily"},"id":"050d715f-2851-48b4-86b6-d93ab4baa1b2","referenceParent":{"type":"Process Definition","name":"Multi-Period-Daily","code":{"codeName":"Multi-Period-Daily","description":"Produces different files with multi-period candles and volumes on a daily format.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"5c56f87a-e3b2-46fc-8e4e-f40c0dacabb5","processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[{"type":"Output Dataset","name":"New Output Dataset","id":"f349a029-5381-4f8e-92d4-1b7e7df76966","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Daily","code":{"codeName":"Multi-Period-Daily"},"parentNode":{"type":"Product Definition","name":"Candles","code":{"codeName":"Candles"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"},"id":"36ae2d5d-6734-4526-b2f8-31c89a0c4fc1"},"id":"742ab33f-d382-4a40-ab03-42e4f1916cc2"}},{"type":"Output Dataset","name":"New Output Dataset","id":"15fd40ad-ceca-46ea-8fdd-4a396f9bde14","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Daily","code":{"codeName":"Multi-Period-Daily"},"parentNode":{"type":"Product Definition","name":"Volumes","code":{"codeName":"Volumes"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"},"id":"b2d5ba69-67ac-490f-9e74-28239b35a92e"},"id":"404b8d12-db14-462c-b4e4-6ee5093560c3"}}],"id":"e130a389-0b18-4433-809d-f44162a00a4a"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"Market Starting Point","code":{"mainUtility":"Market Starting Point"},"id":"93f6d813-594f-49cd-a32f-181a7b8352ee","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Historic-Trades","code":{"codeName":"Historic-Trades","description":"Retrieves and saves the historical trades in batches going backwards from the current time until reaching the begining of the market.","startMode":{"allMonths":{"run":"false","minYear":"2014","maxYear":"2020"},"oneMonth":{"run":"false","year":"2018","month":"01"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"e2c3f7c3-b74c-4145-8a60-f73cc3364629","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"c542a73e-a350-431f-ad3e-10f3ebef8ec7"}},{"type":"Status Dependency","name":"Self Reference","code":{"mainUtility":"Self Reference"},"id":"cb413af9-e1f6-4dbe-ab8c-9f7eb949bd93","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Daily","code":{"codeName":"Multi-Period-Daily","description":"Produces different files with multi-period candles and volumes on a daily format.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"5c56f87a-e3b2-46fc-8e4e-f40c0dacabb5","parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"}},"id":"973fe943-4d30-49eb-84b3-52f6cd9cdbd1"}},{"type":"Status Dependency","name":"Market Ending Point","code":{"mainUtility":"Market Ending Point"},"id":"fbaa8e58-7e12-48d8-81e5-1050c034c736","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Single-Period-Daily","code":{"codeName":"Single-Period-Daily","description":"Produces two data-sets with candles and volumes.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2018","month":"6"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"661e048c-e9e5-435e-bdf9-53dce5ebfa0f","parentNode":{"type":"Indicator Bot","name":"Bruce","code":{"codeName":"AABruce"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"952e8327-4c9a-422a-bf64-cd773ccc36dd"}},"id":"deaa7a7d-b186-42d8-ad64-aab8a7638ca9"}}],"dataDependencies":[{"type":"Data Dependency","name":"New Data Dependency","id":"c9f72b18-362c-4663-9dab-02b592aba3a1","referenceParent":{"type":"Dataset Definition","name":"One-Min","code":{"codeName":"One-Min"},"parentNode":{"type":"Product Definition","name":"Candles","code":{"codeName":"Candles"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Bruce","code":{"codeName":"AABruce"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"952e8327-4c9a-422a-bf64-cd773ccc36dd"},"id":"3b42a93e-c933-420d-9504-25092a0d1279"},"id":"20d5740b-5711-4b8c-9675-a5391f5ba245"}},{"type":"Data Dependency","name":"New Data Dependency","id":"9aff9fc8-4935-4043-9a95-ee2fe02f2cc1","referenceParent":{"type":"Dataset Definition","name":"One-Min","code":{"codeName":"One-Min"},"parentNode":{"type":"Product Definition","name":"Volumes","code":{"codeName":"Volumes"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Bruce","code":{"codeName":"AABruce"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"952e8327-4c9a-422a-bf64-cd773ccc36dd"},"id":"4e714023-0cfd-4945-a573-52922711cd09"},"id":"2788ed30-ed62-4638-9a1d-35dc7e826870"}}],"id":"dab7d491-7a05-47ac-9f86-a551eb24ef67"},"statusReport":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Daily","code":{"codeName":"Multi-Period-Daily","description":"Produces different files with multi-period candles and volumes on a daily format.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"5c56f87a-e3b2-46fc-8e4e-f40c0dacabb5","parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"}},"id":"973fe943-4d30-49eb-84b3-52f6cd9cdbd1"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"b83c7f7c-d0c4-4daa-aa6f-41adaa2626b0","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"f3b263bb-1051-40d8-a69a-d8640cf9afbe","parentNode":{"type":"Process Definition","name":"Single-Period-Daily","id":"661e048c-e9e5-435e-bdf9-53dce5ebfa0f","code":{"codeName":"Single-Period-Daily","description":"Produces two data-sets with candles and volumes.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2018","month":"6"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}}},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"ac785a4c-9848-4e7e-b2ac-5c3c98defa2f","parentNode":{"type":"Process Definition","name":"Multi-Period-Daily","id":"5c56f87a-e3b2-46fc-8e4e-f40c0dacabb5","code":{"codeName":"Multi-Period-Daily","description":"Produces different files with multi-period candles and volumes on a daily format.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"522fca96-a4d5-4cba-9271-4e5f66209390"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"963bf983-f910-4c3e-bdee-b968d56dd155"}}},{"type":"Process Instance","subType":"Indicator Process Instance","name":"Market","code":{"process":"Multi-Period-Market"},"id":"111b43d5-d4ff-414c-8b9f-24f79e2a0254","referenceParent":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces different files with multi-period candles and volumes for entire markets.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"383c3970-13d5-4313-bd8f-7e5d28948577","processOutput":{"type":"Process Output","name":"New Process Output","outputDatasets":[{"type":"Output Dataset","name":"New Output Dataset","id":"7c42483e-6b75-4b61-91c2-597b3fea1aa0","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market"},"parentNode":{"type":"Product Definition","name":"Candles","code":{"codeName":"Candles"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"},"id":"36ae2d5d-6734-4526-b2f8-31c89a0c4fc1"},"id":"7160ac78-d806-4bac-955b-a201c21c2e7e"}},{"type":"Output Dataset","name":"New Output Dataset","id":"5aa52a69-6139-41c0-bce5-68f1419ab7f2","referenceParent":{"type":"Dataset Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market"},"parentNode":{"type":"Product Definition","name":"Volumes","code":{"codeName":"Volumes"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"},"id":"b2d5ba69-67ac-490f-9e74-28239b35a92e"},"id":"8f6d7c41-f829-4157-8365-707a4789138e"}}],"id":"2912df2e-2d79-4a8b-af79-e79d26be51d0"},"processDependencies":{"type":"Process Dependencies","name":"New Process Dependencies","statusDependencies":[{"type":"Status Dependency","name":"Market Starting Point","code":{"mainUtility":"Market Starting Point"},"id":"92e1f19f-986b-43c8-a742-2b4832e061cc","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Historic-Trades","code":{"codeName":"Historic-Trades","description":"Retrieves and saves the historical trades in batches going backwards from the current time until reaching the begining of the market.","startMode":{"allMonths":{"run":"false","minYear":"2014","maxYear":"2020"},"oneMonth":{"run":"false","year":"2018","month":"01"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":60000,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"e2c3f7c3-b74c-4145-8a60-f73cc3364629","parentNode":{"type":"Sensor Bot","name":"Charly","code":{"codeName":"AACharly"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"957bef47-cd90-4dfa-bbb1-3696c527b010"}},"id":"c542a73e-a350-431f-ad3e-10f3ebef8ec7"}},{"type":"Status Dependency","name":"Market Ending Point","code":{"mainUtility":"Market Ending Point"},"id":"701ead56-8e85-4138-bfe8-263b1d59869d","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Single-Period-Daily","code":{"codeName":"Single-Period-Daily","description":"Produces two data-sets with candles and volumes.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2018","month":"6"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"661e048c-e9e5-435e-bdf9-53dce5ebfa0f","parentNode":{"type":"Indicator Bot","name":"Bruce","code":{"codeName":"AABruce"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"952e8327-4c9a-422a-bf64-cd773ccc36dd"}},"id":"deaa7a7d-b186-42d8-ad64-aab8a7638ca9"}},{"type":"Status Dependency","name":"Self Reference","code":{"mainUtility":"Self Reference"},"id":"757b878a-99bd-402c-bd1c-4ae7961e35bf","referenceParent":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces different files with multi-period candles and volumes for entire markets.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"383c3970-13d5-4313-bd8f-7e5d28948577","parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"}},"id":"4f71d561-5872-4539-8408-f481be275559"}}],"dataDependencies":[{"type":"Data Dependency","name":"New Data Dependency","id":"72f6e0db-ed45-4ee8-aac0-188a7db38c1b","referenceParent":{"type":"Dataset Definition","name":"One-Min","code":{"codeName":"One-Min"},"parentNode":{"type":"Product Definition","name":"Candles","code":{"codeName":"Candles"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Bruce","code":{"codeName":"AABruce"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"952e8327-4c9a-422a-bf64-cd773ccc36dd"},"id":"3b42a93e-c933-420d-9504-25092a0d1279"},"id":"20d5740b-5711-4b8c-9675-a5391f5ba245"}},{"type":"Data Dependency","name":"New Data Dependency","id":"0bcc9ab5-7534-4aae-ab82-5dde001673db","referenceParent":{"type":"Dataset Definition","name":"One-Min","code":{"codeName":"One-Min"},"parentNode":{"type":"Product Definition","name":"Volumes","code":{"codeName":"Volumes"},"datasets":[],"parentNode":{"type":"Indicator Bot","name":"Bruce","code":{"codeName":"AABruce"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"952e8327-4c9a-422a-bf64-cd773ccc36dd"},"id":"4e714023-0cfd-4945-a573-52922711cd09"},"id":"2788ed30-ed62-4638-9a1d-35dc7e826870"}}],"id":"af72941b-880c-47b4-8a23-fc7279809d4d"},"statusReport":{"type":"Status Report","name":"New Status Report","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","code":{"codeName":"Multi-Period-Market","description":"Produces different files with multi-period candles and volumes for entire markets.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000},"id":"383c3970-13d5-4313-bd8f-7e5d28948577","parentNode":{"type":"Indicator Bot","name":"Olivia","code":{"codeName":"AAOlivia"},"processes":[],"products":[],"parentNode":{"type":"Team","name":"Masters","code":{"codeName":"AAMasters"},"sensorBots":[],"indicatorBots":[],"tradingBots":[],"plotters":[],"id":"35be7b1c-a0f7-4b5f-9ee1-8fb51595e959"},"id":"30d6289c-4f5c-471e-9d6d-93bfd5453781"}},"id":"4f71d561-5872-4539-8408-f481be275559"},"executionStartedEvent":{"type":"Execution Started Event","name":"New Execution Started Event","id":"d54f53d2-7a7e-4ff7-afdf-33d25405865c","referenceParent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"f3b263bb-1051-40d8-a69a-d8640cf9afbe","parentNode":{"type":"Process Definition","name":"Single-Period-Daily","id":"661e048c-e9e5-435e-bdf9-53dce5ebfa0f","code":{"codeName":"Single-Period-Daily","description":"Produces two data-sets with candles and volumes.","startMode":{"allMonths":{"run":"true","minYear":"2019","maxYear":"2019"},"oneMonth":{"run":"false","year":"2018","month":"6"},"noTime":{"run":"false"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}}},"executionFinishedEvent":{"type":"Execution Finished Event","name":"New Execution Finished Event","id":"63929f31-bc0f-4d9c-9ddc-3d7e76305e51","parentNode":{"type":"Process Definition","name":"Multi-Period-Market","id":"383c3970-13d5-4313-bd8f-7e5d28948577","code":{"codeName":"Multi-Period-Market","description":"Produces different files with multi-period candles and volumes for entire markets.","startMode":{"allMonths":{"run":"false","minYear":"","maxYear":""},"oneMonth":{"run":"false","year":"","month":""},"noTime":{"run":"true"},"fixedInterval":{"run":"false","interval":0}},"deadWaitTime":0,"normalWaitTime":0,"retryWaitTime":10000,"sleepWaitTime":3600000,"comaWaitTime":86400000}}},"calculations":{"type":"Calculations Procedure","name":"New Calculations Procedure","id":"9cd6a59f-a537-4c58-ac92-915db8416ad5"},"dataBuilding":{"type":"Data Building Procedure","name":"New Data Building Procedure","id":"406ff220-1437-4030-816b-3d1de0988a60"}}}],"id":"1e587326-ad4d-4ea8-9273-367b3009ea3d"},"id":"e4164330-478a-4de8-b3ae-db67225bfa7a"}'

    try {
        global.TASK_NODE = JSON.parse(argument)
    } catch (err) {
        console.log(err.stack)
    }
}

require('dotenv').config();

global.WRITE_LOGS_TO_FILES = process.env.WRITE_LOGS_TO_FILES

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = 'Poloniex'
global.MARKET = { assetA: 'USDT', assetB: 'BTC' }
global.CLONE_EXECUTOR = { codeName: 'AACloud', version: '1.1' } // NOTE: To refactor the name of this variable you would need to go through the bots code that are using it.

/*
We need to count how many process instances we deployd and how many of them have already finished their job, either
because they just finished or because there was a request to stop the proceses. In this way, once we reach the
amount of instances started, we can safelly destroy the rest of the objects running and let this nodejs process die.
*/

global.ENDED_PROCESSES_COUNTER = 0
global.TOTAL_PROCESS_INSTANCES_CREATED = 0

/* Here we listen for the message to stop this Task / Process comming from the Task Manager, which is the paret of this node js process. */
process.on('message', message => {
    if (message === 'Stop this Task') {

        global.STOP_TASK_GRACEFULLY = true;

        /*
        There are some process that might no be able to end grafully, for example the ones schedulle to process information in a future day or month.
        In order to be sure that the process will be terminated, we schedulle one forced exit in 2 minutes from now.
        */
        console.log('[INFO] Task Server -> server -> process.on -> Executing order received from Task Manager to Stop this Task. Nodejs process will be exited in less than 1 minute.')
        setTimeout(global.EXIT_NODE_PROCESS, 60000);
    }
});

global.EXIT_NODE_PROCESS = function exitProcess() {

    /* Cleaning Before Exiting. */
    clearInterval(global.HEARTBEAT_INTERVAL_HANDLER)

    for (let i = 0; i < global.TASK_NODE.bot.processes.length; i++) {
        let code = global.TASK_NODE.bot.processes[i].code

        /* Delete the event handler for each process. */

        let key = global.TASK_NODE.bot.code.team + "-" + global.TASK_NODE.bot.code.bot + "-" + code.process

        global.SYSTEM_EVENT_HANDLER.deleteEventHandler(key)

        let process = global.TASK_NODE.bot.processes[i]

        key = process.name + '-' + process.type + '-' + process.id
        global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Stopped') // Meaning Process Stopped
    }

    console.log("[INFO] Task Server -> " + global.TASK_NODE.name + " -> EXIT_NODE_PROCESS -> Task Server will stop in 10 seconds.");

    setTimeout(process.exit, 10000) // We will give 10 seconds to logs be written on file
}

/* Setting up the global Event Handler */

const EVENT_HANDLER_MODULE = require('./SystemEventHandler.js');
const IPC = require('node-ipc');
global.SYSTEM_EVENT_HANDLER = EVENT_HANDLER_MODULE.newSystemEventHandler(IPC)
global.SYSTEM_EVENT_HANDLER.initialize('Task Server', bootLoader)
global.STOP_TASK_GRACEFULLY = false;

function bootLoader() {

    /* Heartbeat sent to the UI */

    let key = global.TASK_NODE.name + '-' + global.TASK_NODE.type + '-' + global.TASK_NODE.id

    global.SYSTEM_EVENT_HANDLER.createEventHandler(key)
    global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Running') // Meaning Task Running
    global.HEARTBEAT_INTERVAL_HANDLER = setInterval(taskHearBeat, 1000)

    function taskHearBeat() {

        /* The heartbeat event is raised at the event handler of the instance of this task, created at the UI. */        
        let event = {
            seconds: (new Date()).getSeconds()
        }
         global.SYSTEM_EVENT_HANDLER.raiseEvent(key, 'Heartbeat', event)
    }

    for (let processIndex = 0; processIndex < global.TASK_NODE.bot.processes.length; processIndex++) {
        let code = global.TASK_NODE.bot.processes[processIndex].code

        /* Validate that the minimun amount of parameters required are defined. */

        if (global.TASK_NODE.bot.code.bot === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'bot' at the Indicator | Sensor | Trading is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
            continue
        }

        if (global.TASK_NODE.bot.code.team === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'team' at the bot is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
            continue
        }

        if (global.TASK_NODE.bot.processes[processIndex].code.process === undefined) {
            console.log("[INFO] Task Server -> server -> bootLoader -> Parameter 'process' at object Process is undefined. This process will not be executed. -> Process = " + global.TASK_NODE.bot.processes[processIndex].name);
            continue
        }

        /* Create the event handler for each process. This event handlers are where the status reports updated events are raised. */

        let key = global.TASK_NODE.bot.code.team + "-" + global.TASK_NODE.bot.code.bot + "-" + code.process
        global.SYSTEM_EVENT_HANDLER.createEventHandler(key)

        if (global.TASK_NODE.bot.code.repo === undefined) {
            global.TASK_NODE.bot.code.repo = global.TASK_NODE.bot.code.bot + "-" + global.TASK_NODE.bot.type + "-Bot"
        }

        startRoot(processIndex);
    }
}

function startRoot(processIndex) {

    console.log('[INFO] Task Server -> server -> startRoot -> Entering function. ')

    const ROOT_MODULE = require('./Root')
    let root = ROOT_MODULE.newRoot()

    root.initialize(onInitialized)

    function onInitialized() {
        console.log('[INFO] Task Server -> server -> startRoot -> onInitialized -> Entering function. ')
        root.start(processIndex)
    }
}

