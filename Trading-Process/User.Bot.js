exports.newUserBot = function newUserBot(bot, logger) {

    const MODULE_NAME = 'User Bot';
    const FULL_LOG = true;
    const ERROR_LOG = true;

    let thisObject = {
        initialize: initialize,
        start: start
    };

    let assistant;                           // You will receive a reference to the platform at your initialize function. 


    return thisObject;

    function initialize(pAssistant, callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] initialize -> Entering function.'); }

            logger.fileName = MODULE_NAME;

            /* Store local values. */
            assistant = pAssistant;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            if (ERROR_LOG === true) { logger.write(MODULE_NAME, '[ERROR] initialize -> onDone -> err = ' + err.message); }
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> Entering function.'); }

            /*

            This is an example. This bot will trade with a pseudo strategy based on candle and volumes stairs patterns.
            Essentially it will look at the patterns it is in at different time periods and try to make a guess if it is a good time to buy,
            sell, or do nothing.

            */

            if (global.AT_BREAKPOINT === true) {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] run -> loop -> Plot Breakpoint Hit."); }

            }

            decideWhatToDo(onDone);

            function onDone(err) {
                try {

                    switch (err.result) {
                        case global.DEFAULT_OK_RESPONSE.result: { 
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, '[INFO] start -> onDone -> Execution finished well.'); }

                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            if (ERROR_LOG === true) { logger.write(MODULE_NAME, '[ERROR] start -> onDone -> Retry Later. Requesting Execution Retry.'); }
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                            break;
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            if (ERROR_LOG === true) { logger.write(MODULE_NAME, '[ERROR] start -> onDone -> Operation Failed. Aborting the process.'); }
                            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                            return;
                        }
                            break;
                    }

                } catch (err) {
                    if (ERROR_LOG === true) { logger.write(MODULE_NAME, '[ERROR] start -> onDone -> err = ' + err.message); }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function decideWhatToDo(callBack) {

                try {

                    if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> Entering function.'); }

                    let balance = assistant.getAvailableBalance();

                    let rate = assistant.getMarketRate();
                    rate = Number(rate.toFixed(8));

                    let amountA; 
                    let amountB;

                    let balanceA = Number(balance.assetA);
                    let balanceB = Number(balance.assetB);

                    if (balanceA === 0 && balanceB === 0) {

                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> Cannot place orders since Available Balance is zero on both Assets.'); }
                        callBack(global.DEFAULT_OK_RESPONSE);
                        return;

                        let messageRelevance = Math.trunc(Math.random() * 10);

                        switch (messageRelevance) {

                            case 1: {
                                assistant.sendMessage(messageRelevance, 'No Available Balance','Cannot place orders since Available Balance is zero on both Assets.');
                                break;
                            }
                            case 3: {
                                assistant.sendMessage(messageRelevance, 'Available Balance Too Low', 'Available balances too low on both assets.');
                                break;
                            }
                            case 5: {
                                assistant.sendMessage(messageRelevance, 'Orders Already at Order Book', 'All intended orders have already been put at the order book.');
                                break;
                            }

                        }
                    }

                    if (Math.random() * 10 > 3) {

                        let messageRelevance = Math.trunc(Math.random() * 6);

                        switch (messageRelevance) {

                            case 1: {
                                assistant.sendMessage(messageRelevance, 'Feeling Lazy', 'I dont feel like putting any order by now. Will think about it later.');
                                break;
                            }
                            case 3: {
                                assistant.sendMessage(messageRelevance, 'Not Right Time', 'According to my internal calculations, this is not a good time to place an order.');
                                break;
                            }
                            case 5: {
                                assistant.sendMessage(messageRelevance, 'Not Feeling Lucky', 'I am currently not feeling lucky, for that reason I wont put any order now.');
                                break;
                            }

                        }

                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> In some situations it is just fin no to place orders. Passing this turn. '); }
                        callBack(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    
                    if (balanceA > 0) {

                        amountA = balanceA;
                        amountA = Number(amountA.toFixed(8));

                        amountB = amountA / rate;
                        amountB = Number(amountB.toFixed(8));

                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> Decided to BUY.'); }
                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> amountA = ' + amountA); }
                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> amountB = ' + amountB); }
                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> rate = ' + rate); }

                        assistant.putPosition('buy', rate, amountA, amountB, callBack);

                        assistant.sendMessage(10, 'Buy Order Placed', 'I ve just placed a Buy order because I thought the rate ' + rate + ' was great.');
                    }

                    if (balanceB > 0) {

                        amountB = balanceB; 
                        amountB = Number(amountB.toFixed(8));

                        amountA = amountB * rate;
                        amountA = Number(amountA.toFixed(8));

                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> Decided to SELL.'); }
                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> amountA = ' + amountA); }
                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> amountB = ' + amountB); }
                        if (FULL_LOG === true) { logger.write( MODULE_NAME, '[INFO] start -> decideWhatToDo -> rate = ' + rate); }

                        assistant.putPosition('sell', rate, amountA, amountB, callBack);

                        assistant.sendMessage(10, 'Sell Order Placed', 'I ve just placed a Sell order because I believe it was the right time to do so.');
                    } 

                } catch (err) {
                    if (ERROR_LOG === true) { logger.write(MODULE_NAME, '[ERROR] start -> decideWhatToDo -> err = ' + err.message); }
                    callBack(global.DEFAULT_FAIL_RESPONSE);
                }
            }

        } catch (err) {
            if (ERROR_LOG === true) { logger.write(MODULE_NAME, '[ERROR] start -> err = ' + err.message); }
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
