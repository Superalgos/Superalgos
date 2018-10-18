import {
  GraphQLObjectType,
  GraphQLString
} from 'graphql'

const PlotterType = new GraphQLObjectType({
  name: 'Plotter',
  fields: () => ({
    codeName: { type: GraphQLString },
    host: { type: GraphQLString },
    repo: { type: GraphQLString },
    moduleName: { type: GraphQLString }
  })
})

export default PlotterType
