import {
  GraphQLString,
  GraphQLInputObjectType,
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'PresentationInput',
  description: 'Payload for presentation input',
  fields: () => ({
    banner: { type: GraphQLString },
    profile: { type: GraphQLString },
    page: { type: GraphQLString },
  }),
});

export default Type;
