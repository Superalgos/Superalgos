function processElement(element, aggregationType) {
    // This function aggregates a raw min chunk into an aggregated min chunk
    // This is the function that will be run in parallel
    let result
    process.send("in processElement"); 
     console.log("in processElement")

    switch (aggregationType) {
        case "avg":
            result = element *2
            break;
        default:
            result = element
            break
    }
    console.log("returning result: ", result)
    return result;
  }
  
  process.on('message', (element, type) => {
    console.log("message from parent recieved: ", element, type)
    const result = processElement(element, type);
    process.send(result);
  });