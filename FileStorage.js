
const path = require('path')

exports.newFileStorage = function newFileStorage(logger) {

    const MODULE_NAME = 'FileStorage'
    const MAX_RETRY = 30
    const RETRY_TIME_IN_MILISECONDS = 250
    let currentRetryGetTextFile = 0
    let currentRetryWriteTextFile = 0

    if (logger === undefined) { // Dummy logger
        logger = {}
        function write() {

        }
        logger.write = write
    }

    let thisObject = {
        getTextFile: getTextFile,
        createTextFile: createTextFile,
        deleteTextFile: deleteTextFile
    }

  return thisObject

    function getTextFile(filePath, callBackFunction, noRetry) {

        logger.write(MODULE_NAME, '[INFO] FileStorage -> getTextFile -> Entering Function.')

        let fileDoesNotExist = false

        /* Choose path for either bots or data */
        let fileLocation
        if (filePath.indexOf("/bots/") > 0) {
            fileLocation = process.env.BOTS_PATH + '/' +  filePath
        } else {
            fileLocation = process.env.STORAGE_PATH + '/' +  filePath
        }

        try {

            logger.write(MODULE_NAME, '[INFO] FileStorage -> getTextFile -> fileLocation: ' + fileLocation)

            /* Here we actually write the file. */
            const fs = require('fs')
            fs.readFile(fileLocation, onFileRead)

            function onFileRead(err, text) {

                if (err) {

                    if (err.code === 'ENOENT') { // since files are deleted before being replaced, it can happen that it does not exist and after a retry it does.
                        if (noRetry === true) {
                            logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> onFileRead -> File does not exist. Not Retrying. ')
                            let customResponse = {
                                result: global.CUSTOM_FAIL_RESPONSE.result,
                                message: 'File does not exist.'
                            }
                            callBackFunction(customResponse)
                            return
                        } else {
                            fileDoesNotExist = true
                            logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> onFileRead -> File does not exist. Retrying. ')
                            setTimeout(retry, RETRY_TIME_IN_MILISECONDS)
                            return
                        }
                    }

                    logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> onFileRead -> Error reading file -> err = ' + err.stack)
                    logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> onFileRead -> Error reading file -> filePath = ' + filePath)
                    logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> onFileRead -> Error reading file -> err = ' + err.stack)
                    setTimeout(retry, RETRY_TIME_IN_MILISECONDS)
                    return
                } 

                if (text.toString() === "") {
                    logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> onFileRead -> Read and Empty File -> filePath = ' + filePath)
                    setTimeout(retry, RETRY_TIME_IN_MILISECONDS)
                    return
                }

                callBackFunction(global.DEFAULT_OK_RESPONSE, text.toString())
            }

        } catch (err) {
            logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> Error writing file -> file = ' + fileLocation)
            logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> Error writing file -> err = ' + err.stack)
            retry()
        }

        function retry() {
            if (currentRetryGetTextFile < MAX_RETRY) {
                currentRetryGetTextFile++
                logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> retry -> Will try to read the file again -> Retry #: ' + currentRetryGetTextFile)
                getTextFile(filePath, callBackFunction)
            } else {
                currentRetryGetTextFile = 0

                if (fileDoesNotExist === true) {
                    logger.write(MODULE_NAME, '[WARN] FileStorage -> getTextFile -> retry -> Max retries reached reading a file. File Not Found.')
                    let customResponse = {
                        result: global.CUSTOM_FAIL_RESPONSE.result,
                        message: 'File does not exist.'
                    }
                    callBackFunction(customResponse)
                    return
                } else {
                    logger.write(MODULE_NAME, '[ERROR] FileStorage -> getTextFile -> retry -> Max retries reached reading a file. Giving up.')
                    logger.write(MODULE_NAME, '[ERROR] FileStorage -> getTextFile -> retry -> file = ' + fileLocation)
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                    return
                }
            }
        }
    }

    function createTextFile(filePath, fileContent, callBackFunction) {

        logger.write(MODULE_NAME, '[INFO] FileStorage -> createTextFile -> Entering Function.')

        /* Choose path for either logs or data */
        let fileLocation
        if (filePath.indexOf("/Logs/") > 0) {
            fileLocation = process.env.LOG_PATH + '/' +  filePath
        } else {
            fileLocation = process.env.STORAGE_PATH + '/' +  filePath
        }

        try {

            logger.write(MODULE_NAME, '[INFO] FileStorage -> createTextFile -> fileLocation: ' + fileLocation)

            /* If necesary a folder or folders are created before writing the file to disk. */
            let directoryPath = fileLocation.substring(0, fileLocation.lastIndexOf('/') + 1);
            mkDirByPathSync(directoryPath)

            /*
            Here we write the file with a temporary name so as to avoid dirty read from other processes.
            Then we delete the original file, if exists, and finally we rename the temporary into the original name.
            */
            const fs = require('fs')
            fs.writeFile(fileLocation + '.tmp', fileContent, onFileWritenn)

            function onFileWritenn(err) {
                if (err) {
                    logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> onFileWriten -> Error writing file -> file = ' + fileLocation)
                    logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> onFileWriten -> Error writing file -> err = ' + err.stack)
                    setTimeout(retry, RETRY_TIME_IN_MILISECONDS)
                } else {

                    const fs = require('fs')
                    fs.unlink(fileLocation, onUnlinked)

                    function onUnlinked(err) {
                        let code = ''
                        if (err) {
                            code = err.code
                        }
                        if (code !== '' && code !== 'ENOENT') {
                            logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> onFileWriten -> onUnlinked -> Error renaming file -> file = ' + fileLocation)
                            logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> onFileWriten -> onUnlinked -> Error renaming file -> err = ' + err.stack)
                            setTimeout(retry, RETRY_TIME_IN_MILISECONDS)
                        } else {

                            const fs = require('fs')
                            fs.rename(fileLocation + '.tmp', fileLocation, onRenamed)

                            function onRenamed(err) {
                                if (err) {
                                    logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> onFileWriten -> onUnlinked -> onRenamed -> Error renaming file -> file = ' + fileLocation + '.tmp')
                                    logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> onFileWriten -> onUnlinked -> onRenamed -> Error renaming file -> err = ' + err.stack)
                                    setTimeout(retry, RETRY_TIME_IN_MILISECONDS)
                                } else {

                                    callBackFunction(global.DEFAULT_OK_RESPONSE)

                                }
                            }
                        }
                    }
                }
            }

        } catch (err) {
            logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> Error writing file -> file = ' + fileLocation)
            logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> Error writing file -> err = ' + err.stack)
            retry()
        }

        function retry() {
            if (currentRetryWriteTextFile < MAX_RETRY) {
                currentRetryWriteTextFile++
                logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> retry -> Will try to write the file again -> Retry #: ' + currentRetryWriteTextFile)
                createTextFile(filePath, fileContent, callBackFunction)
            } else {
                currentRetryWriteTextFile = 0
                logger.write(MODULE_NAME, '[ERROR] FileStorage -> createTextFile -> retry -> Max retries reached writting a file. Giving up.')
                logger.write(MODULE_NAME, '[ERROR] FileStorage -> createTextFile -> retry -> file = ' + fileLocation)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
            }
        }
    }

    function deleteTextFile(filePath, callBackFunction) {

        logger.write(MODULE_NAME, '[INFO] FileStorage -> deleteTextFile -> Entering Function.')

        /* Choose path for either logs or data */
        let fileLocation
        if (filePath.indexOf("/Logs/") > 0) {
            fileLocation = process.env.LOG_PATH + '/' +  filePath
        } else {
            fileLocation = process.env.STORAGE_PATH + '/' +  filePath
        }

        try {

            logger.write(MODULE_NAME, '[INFO] FileStorage -> deleteTextFile -> fileLocation: ' + fileLocation)

            const fs = require('fs')
            fs.unlink(fileLocation, onUnlinked)

            function onUnlinked(err) {
                if (err) {
                    if (callBackFunction !== undefined) {
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE)
                    }
                } else {
                    if (callBackFunction !== undefined) {
                        callBackFunction(global.DEFAULT_OK_RESPONSE)
                    }
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, '[WARN] FileStorage -> deleteTextFile -> Error writing file -> file = ' + fileLocation)
            logger.write(MODULE_NAME, '[WARN] FileStorage -> deleteTextFile -> Error writing file -> err = ' + err.stack)
            if (callBackFunction !== undefined) {
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
            }
        }

        function retry() {
            if (currentRetryWriteTextFile < MAX_RETRY) {
                currentRetryWriteTextFile++
                logger.write(MODULE_NAME, '[WARN] FileStorage -> createTextFile -> retry -> Will try to write the file again -> Retry #: ' + currentRetryWriteTextFile)
                createTextFile(filePath, fileContent, callBackFunction)
            } else {
                currentRetryWriteTextFile = 0
                logger.write(MODULE_NAME, '[ERROR] FileStorage -> createTextFile -> retry -> Max retries reached writting a file. Giving up.')
                logger.write(MODULE_NAME, '[ERROR] FileStorage -> createTextFile -> retry -> file = ' + fileLocation)
                callBackFunction(global.DEFAULT_FAIL_RESPONSE)
            }
        }
    }

 /* Function to create folders of missing folders at any path. */

  function mkDirByPathSync(targetDir, { isRelativeToScript = false } = {}) {
    const sep = '/';
    const initDir = path.isAbsolute(targetDir) ? sep : '';
    const baseDir = isRelativeToScript ? __dirname : '.';

    return targetDir.split(sep).reduce((parentDir, childDir) => {
      const curDir = path.resolve(baseDir, parentDir, childDir);
      try {
        const fs = require('fs')
        fs.mkdirSync(curDir);
      } catch (err) {
        if (err.code === 'EEXIST') { // curDir already exists!
          return curDir;
        }

        // To avoid `EISDIR` error on Mac and `EACCES`-->`ENOENT` and `EPERM` on Windows.
        if (err.code === 'ENOENT') { // Throw the original parentDir error on curDir `ENOENT` failure.
          throw new Error(`EACCES: permission denied, mkdir '${parentDir}'`);
        }

        const caughtErr = ['EACCES', 'EPERM', 'EISDIR'].indexOf(err.code) > -1;
        if (!caughtErr || caughtErr && curDir === path.resolve(targetDir)) {
          throw err; // Throw if it's just the last created dir.
        }
      }

      return curDir;
    }, initDir);
  }
}
