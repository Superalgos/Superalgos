import {
  GraphQLObjectType,
} from 'graphql';

import AddTeamMutation from './AddTeam';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddTeamMutation,
  ),
});

export default Mutation;
