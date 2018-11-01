import {
  GraphQLObjectType,
} from 'graphql';

import HostEventMutation from './HostEvent';
import EditEventMutation from './EditEvent';
import RegisterToEventMutation from './RegisterToEvent';
import EditParticipantMutation from './EditParticipant';
import AddRuleMutation from './AddRule';
import EditRuleMutation from './EditRule';
import ReorderRulesMutation from './ReorderRules';
import AddPrizeMutation from './AddPrize';
import EditPrizeMutation from './EditPrize';
import CreateFormulaMutation from './CreateFormula';
import CreateAndSetFormulaMutation from './CreateAndSetFormula';
import CreatePlotterMutation from './CreatePlotter';
import CreateAndSetPlotterMutation from './CreateAndSetPlotter';

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: Object.assign(
    HostEventMutation,
    EditEventMutation,
    RegisterToEventMutation,
    EditParticipantMutation,
    AddRuleMutation,
    EditRuleMutation,
    ReorderRulesMutation,
    AddPrizeMutation,
    EditPrizeMutation,
    CreateFormulaMutation,
    CreateAndSetFormulaMutation,
    CreatePlotterMutation,
    CreateAndSetPlotterMutation,
  ),
});

export default Mutation;
