exports.newDataMiningFunctionLibrariesAggregationMethods = function () {

  let thisObject = {
      average: average
  }

  return thisObject

  /**
   * The function calculates the average of specific record properties in an array of data.
   * @param recordProperties - An array of objects that define the properties of the data being
   * processed. Each object contains a configuration object with a codeName property that corresponds
   * to the property name in the raw data, and other properties that define how the data should be
   * processed.
   * @param dataArray - The array of raw data rows that needs to be processed to calculate the average
   * of certain record properties.
   * @returns an array containing the beginning and ending time for a chunk of data, followed by the
   * average value for each record property in the input data array.
   */
  function average(recordProperties, dataArray) {
    let outputElementAverage = {}
    let outputElement = {}
    let rawDataRow
    let processedChunk = []

    // Grab beginning and ending time for this chunk
    processedChunk.push(dataArray[0])
    processedChunk.push(dataArray[1])
    // loop through each raw data row

    for (let i = 2; i < dataArray.length; i++) {
      rawDataRow = dataArray[i]
      // loop through each record property
      for (let j = 2; j < recordProperties.length; j++) {

        // If value is a string only the most recent string value is kept
        if (recordProperties[j].config.isString === true) {
          outputElementAverage[recordProperties[j].config.codeName] = rawDataRow[recordProperties[j].config.codeName]
          continue
        }

        // define the output element for the current record property on the first loop
        if (outputElementAverage[recordProperties[j].config.codeName] === undefined) {
          outputElementAverage[recordProperties[j].config.codeName] = {}
          outputElementAverage[recordProperties[j].config.codeName].sum = 0
          outputElementAverage[recordProperties[j].config.codeName].count = 0
        }

        outputElementAverage[recordProperties[j].config.codeName].sum += rawDataRow[recordProperties[j].config.codeName]
        outputElementAverage[recordProperties[j].config.codeName].count += 1
      }
    }

    processedChunk

    for (let j = 2; j < recordProperties.length; j++) {
      if (recordProperties[j].config.isString === false) {
        outputElement[recordProperties[j].config.codeName] = outputElementAverage[recordProperties[j].config.codeName].sum / outputElementAverage[recordProperties[j].config.codeName].count
        processedChunk.push(outputElement[recordProperties[j].config.codeName])
      } else {
        processedChunk.push(outputElementAverage[recordProperties[j].config.codeName])
      }
    }

    return processedChunk
  }
}