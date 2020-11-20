import {
  GraphQLEnumType,
} from 'graphql';

import { ParticipantStateEnum } from '../../../enums/ParticipantState';

const values = {};
ParticipantStateEnum.forEach((ParticipantState) => {
  values[ParticipantState] = { value: ParticipantState };
});

const ParticipantStateEnumType = new GraphQLEnumType({
  name: 'ParticipantStateEnum',
  values,
});

export {
  ParticipantStateEnumType as default,
};
