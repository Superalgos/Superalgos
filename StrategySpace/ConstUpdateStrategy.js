const GRAPHQL_MUTATION_UPDATE_STRATEGIES = Apollo.gql`
  mutation strategizer_EditStrategy($id: ID!, $strategy: strategizer_StrategyInput!) {
    strategizer_EditStrategy(id: $id, strategy: $strategy) {
      id
    }
  }
`
