import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const PresentationType = new GraphQLObjectType({
  name: 'Presentation',
  description: 'Presentation page of the event',
  fields: () => ({
    banner: { type: GraphQLString },
    profile: { type: GraphQLString },
    page: { type: GraphQLString },
  }),
});

export default PresentationType;
