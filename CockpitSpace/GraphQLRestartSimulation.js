
async function graphQlRestartSimulation (simulationParams) {
  try {
    const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

    if (accessToken === null) {
      throw new Error('Can not restart the simulation because the user is not logged in. ')
    }

    const graphQLServer = await axios({
      url: window.canvasApp.graphQL.masterAppApiUrl,
      method: 'post',
      data: {
        query: `
              mutation operations_RunSimulation(
                $simulation: operations_SimulationInput)
                {
                operations_RunSimulation(simulation: $simulation)
                }
              `,
        variables: {
          simulation: simulationParams
        }
      },
      headers: {
        authorization: 'Bearer ' + accessToken
      }
    })

    if (graphQLServer.data.errors) {
      console.log(graphQLServer.data.errors)
      throw new Error(graphQLServer.data.errors[0].message)
    }
  } catch (err) {
    console.log(err.stack)
    throw new Error('There has been an error restarting the simulation. Error: ' + err.stack)
  }
}

