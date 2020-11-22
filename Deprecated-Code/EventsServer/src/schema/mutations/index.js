import {
  GraphQLObjectType,
} from 'graphql';

import CreateEventMutation from './CreateEvent';
import EditEventMutation from './EditEvent';
import RegisterToEventMutation from './RegisterToEvent';
import EditParticipantMutation from './EditParticipant';
import CreateFormulaMutation from './CreateFormula';
import CreatePlotterMutation from './CreatePlotter';
import ChangeEventStateMutation from './ChangeEventState';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    CreateEventMutation,
    EditEventMutation,
    RegisterToEventMutation,
    EditParticipantMutation,
    CreateFormulaMutation,
    CreatePlotterMutation,
    ChangeEventStateMutation,
  ),
});

export default Mutation;
