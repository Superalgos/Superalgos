function newSuperalgosUtilitiesDownload() {
    thisObject = {
        downloadText: downloadText,
        downloadCanvas: downloadCanvas,
        downloadPanorama: downloadPanorama,
        addToMarketPanorama: addToMarketPanorama
    }

    return thisObject

    function downloadText(filename, text) {
        let element = document.createElement('a')
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text))
        element.setAttribute('download', filename)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    function downloadCanvas(filename, canvasToUse) {
        let data = canvasToUse.toDataURL('image/png', 1)
        /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
        data = data.replace(/^data:image\/[^;]*/, 'data:application/octet-stream')

        /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
        data = data.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=' + filename + '.png')

        let element = document.createElement('a')
        element.setAttribute('href', data)
        element.setAttribute('download', filename + '.PNG')
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    function downloadPanorama(filename) {
        let INITIAL_WIDTH = 800
        let FINAL_WIDTH = browserCanvas.width - INITIAL_WIDTH

        if (ARE_WE_RECORDING_A_MARKET_PANORAMA === false) {
            /* We start recording the panorame. */
            ARE_WE_RECORDING_A_MARKET_PANORAMA = true
            marketPanoramaCanvas = document.createElement('canvas')
            marketPanoramaCanvas.width = INITIAL_WIDTH * 50
            marketPanoramaCanvas.height = browserCanvas.height
            marketPanoramaCanvas.getContext('2d').drawImage(browserCanvas, 0, 0, INITIAL_WIDTH, browserCanvas.height, 0, 0, INITIAL_WIDTH, browserCanvas.height)
            CURRENT_PANORAMA_POSITION = INITIAL_WIDTH
        } else {
            /* We stop recording and download the resulting image. */
            ARE_WE_RECORDING_A_MARKET_PANORAMA = false
            marketPanoramaCanvas.getContext('2d').drawImage(browserCanvas, browserCanvas.width - FINAL_WIDTH, 0, FINAL_WIDTH, browserCanvas.height, CURRENT_PANORAMA_POSITION, 0, FINAL_WIDTH, browserCanvas.height)
            let finalResultCanvas = document.createElement('canvas')
            finalResultCanvas.width = CURRENT_PANORAMA_POSITION + FINAL_WIDTH
            finalResultCanvas.height = browserCanvas.height
            finalResultCanvas.getContext('2d').drawImage(marketPanoramaCanvas, 0, 0, finalResultCanvas.width, browserCanvas.height, 0, 0, finalResultCanvas.width, browserCanvas.height)
            downloadCanvas(filename, finalResultCanvas)
            marketPanoramaCanvas = undefined
        }
    }

    function addToMarketPanorama() {
        let SECTION_WIDTH = 80 * 2
        let INITIAL_POSITION = 800 - SECTION_WIDTH
        marketPanoramaCanvas.getContext('2d').drawImage(browserCanvas, INITIAL_POSITION, 0, SECTION_WIDTH, browserCanvas.height, CURRENT_PANORAMA_POSITION, 0, SECTION_WIDTH, browserCanvas.height)
        CURRENT_PANORAMA_POSITION = CURRENT_PANORAMA_POSITION + SECTION_WIDTH
    }
}