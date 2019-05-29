import {
  GraphQLObjectType,
} from 'graphql';

import AddTeamMutation from './AddTeam';
import DeleteTeamMutation from './DeleteTeam';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    AddTeamMutation,
    DeleteTeamMutation
  ),
});

export default Mutation;
