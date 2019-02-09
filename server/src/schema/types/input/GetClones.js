import {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLID
} from 'graphql';

const Type = new GraphQLInputObjectType({
  name: 'GetClonesInput',
  description: 'Allows to receive a list of clone ids to get information',
  fields: () => ({
    cloneIdList: { type: new GraphQLList(GraphQLID) }
    })
});

export default Type;
