function processElement(element, aggregationType) {
    // This function aggregates a raw min chunk into an aggregated min chunk
    // This is the function that will be run in parallel
    let result 

    switch (aggregationType) {
        case "avg":
            result = element *2
            break;
        default:
            result = element
            break
    }
  
    return result;
  }
  
  process.on('message', (element, type) => {
    const result = processElement(element, type);
    process.send(result);
  });