import {
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

const SubPrizeType = new GraphQLObjectType({
  name: 'SubPrize',
  description: 'Prize',
  fields: () => ({
    condition: { type: GraphQLString },
  }),
});

export default SubPrizeType;
