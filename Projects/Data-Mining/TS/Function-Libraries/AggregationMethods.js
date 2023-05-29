exports.newDataMiningFunctionLibrariesAggregationMethods = function () {

  let thisObject = {
      average: average
  }

  return thisObject

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
      outputElement[recordProperties[j].config.codeName] = outputElementAverage[recordProperties[j].config.codeName].sum / outputElementAverage[recordProperties[j].config.codeName].count
      processedChunk.push(outputElement[recordProperties[j].config.codeName])
    }

    return processedChunk
  }
}