import {
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
  GraphQLID,
} from 'graphql';
import axios from 'axios';
import { ServiceUnavailableError } from '../../errors';
import { Event } from '../../models';
import {
  FormulaType,
  PlotterType,
  RuleType,
  ParticipantType,
  PrizeType,
  InvitationType,
  PresentationType,
} from './index';
import EventStateEnumType from './enum/EventState';

const EventType = new GraphQLObjectType({
  name: 'Event',
  description: 'Everything you need to know about an event',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    subtitle: { type: GraphQLString },
    hostId: { type: GraphQLString },
    description: { type: GraphQLString },
    startDatetime: { type: GraphQLInt },
    endDatetime: { type: GraphQLInt },
    state: { type: EventStateEnumType },
    rules: {
      type: new GraphQLList(RuleType),
      resolve(parent) {
        return parent.rules;
      },
    },
    prizes: {
      type: new GraphQLList(PrizeType),
      resolve(parent) {
        return parent.prizes;
      },
    },
    participants: {
      type: new GraphQLList(ParticipantType),
      resolve(parent) {
        return parent.participants;
      },
    },
    participatingAsId: {
      type: new GraphQLList(GraphQLString),
      resolve({ id: _id }, arg, { authorization }) {
        if (!authorization) {
          return ({});
        }
        return new Promise((res, rej) => {
          axios({
            url: process.env.GATEWAY_ENDPOINT,
            method: 'post',
            data: {
              query: `
                {
                  teams_TeamsByRole{
                    id
                  }
                }
              `,
            },
            headers: { authorization },
          }).then(
            (result) => {
              const ret = [];
              Event.findOne({ _id }).exec((err, event) => {
                if (err) {
                  rej(err);
                  return;
                }
                result.data.data.teams_TeamsByRole.forEach((team) => {
                  if (event.participants.some(participant => participant.participantId === team.id)) {
                    ret.push(team.id);
                  }
                });
                res(ret);
              });
            },
            (error) => {
              rej(new ServiceUnavailableError(error));
            },
          );
        });
      },
    },
    canParticipateAsId: {
      type: new GraphQLList(GraphQLString),
      resolve({ id: _id }, arg, { authorization }) {
        if (!authorization) {
          return ({});
        }
        return new Promise((res, rej) => {
          axios({
            url: process.env.GATEWAY_ENDPOINT,
            method: 'post',
            data: {
              query: `
                {
                  teams_TeamsByRole{
                    id
                  }
                }
              `,
            },
            headers: { authorization },
          }).then(
            (result) => {
              const ret = [];
              Event.findOne({ _id }).exec((err, event) => {
                if (err) {
                  rej(err);
                  return;
                }
                result.data.data.teams_TeamsByRole.forEach((team) => {
                  if (!(event.participants.some(participant => participant.participantId === team.id))) {
                    ret.push(team.id);
                  }
                });
                res(ret);
              });
            },
            (error) => {
              rej(new ServiceUnavailableError(error));
            },
          );
        });
      },
    },
    invitations: {
      type: new GraphQLList(InvitationType),
      resolve(parent) {
        return parent.invitations;
      },
    },
    presentation: {
      type: PresentationType,
      resolve(parent) {
        return parent.presentation;
      },
    },
    formula: {
      type: FormulaType,
      resolve(parent) {
        return parent.formulaId;
      },
    },
    plotter: {
      type: PlotterType,
      resolve(parent) {
        return parent.plotterId;
      },
    },
  }),
});

export default EventType;
