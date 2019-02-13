import {
  GraphQLObjectType,
} from 'graphql';

import CreateEventMutation from './CreateEvent';
import ChangeEventStateMutation from './ChangeEventState';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    CreateEventMutation,
    ChangeEventStateMutation,
  ),
});

export default Mutation;
