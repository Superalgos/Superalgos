
const GRAPHQL_MUTATION_RESTART_SIMULATION = Apollo.gql`
      mutation operations_RunSimulation(
        $simulation: operations_SimulationInput)
        {
        operations_RunSimulation(simulation: $simulation)
        }
      `

async function restartSimulation (simulationParams) {
  try {
    const accessToken = window.localStorage.getItem(LOGGED_IN_ACCESS_TOKEN_LOCAL_STORAGE_KEY)

    if (accessToken === null) {
      if (ERROR_LOG === true) { logger.write('[ERROR] restartSimulation -> Can not restart the simulation because the user is not logged in. ') }
      return
    }

    const apolloClient = new Apollo.lib.ApolloClient({
      networkInterface: Apollo.lib.createNetworkInterface({
        uri: window.canvasApp.graphQL.masterAppApiUrl,
        transportBatching: true
      }),
      connectToDevTools: true
    })

    const networkInterface = Apollo.lib.createNetworkInterface({
      uri: window.canvasApp.graphQL.masterAppApiUrl
    })

    networkInterface.use([{
      applyMiddleware (req, next) {
        req.options.headers = {
          authorization: `Bearer ${accessToken}`
        }
        next()
      }
    }])

    const graphQlRestartSimuulation = () => {
      return new Promise((resolve, reject) => {
        apolloClient.mutate({
          mutation: GRAPHQL_MUTATION_RESTART_SIMULATION,
          variables: {
            simulation: simulationParams
          }
        })
        .then(response => {
          resolve(true)
        })
        .catch(err => {
          if (ERROR_LOG === true) { logger.write('[ERROR] restartSimulation -> ApolloClient error restarting simulation -> err = ' + err.stack) }
          reject(err)
        })
      })
    }

    let result = await graphQlRestartSimuulation()

    return result
  } catch (err) {
    if (ERROR_LOG === true) { logger.write('[ERROR] restartSimulation -> err = ' + err.stack) }
  }
}
