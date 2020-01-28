// generic low level reusuable utils for interacting with exchanges.

const retry = require('retry');

const retryInstance = (options, checkFn, callback) => {
  if (!options) {
    options = {
      retries: 30,
      factor: 1.5,
      minTimeout: 1 * 1000,
      maxTimeout: 8 * 1000
    };
  }

  const operation = retry.operation(options);
  operation.attempt(function (currentAttempt) {
    checkFn((err, result) => {
      if (!err) {
        callback(global.DEFAULT_OK_RESPONSE, result);
        return;
      } else if (err.result === global.CUSTOM_OK_RESPONSE.result) {
        callback(err, result);
        return;
      }

      if (currentAttempt > options.retries) {
        callback(global.DEFAULT_FAIL_RESPONSE);
        return;
      }

      if (err.notFatal) {
        if (err.backoffDelay) {
          setTimeout(() => operation.retry(err), err.backoffDelay);
        }

        console.log("Retrying Exchange Operation at: " + new Date().toISOString())
        operation.retry(err);
      } else {
        callback(err, result);
      }
    });
  });
}

const includes = function (str, list) {
  for (let i = 0; i < list.length; i++) {
    const element = list[i];
    if (element === str) {
      return true;
    }
  }
}

module.exports = {
  retry: retryInstance,
  includes
}
