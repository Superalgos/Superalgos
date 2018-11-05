import 'dotenv/config';
import {
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import axios from 'axios';
import {
  AuthentificationError,
  WrongArgumentsError,
  ServiceUnavailableError,
} from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';
import { ParticipantInputType } from '../types/input';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
  participant: { type: ParticipantInputType },
};

const resolve = (parent,
  { eventId: _id, participant: { teamId, botId, releaseId } },
  { userId, authorization }) => {
  if (!userId) {
    throw new AuthentificationError();
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
        if (!result.data.data.teamsByRole.some(team => team.id === teamId)) {
          rej(new WrongArgumentsError('You are not eligible to register this team'));
          return;
        }
        Event.findOne({ _id }).exec((err, event) => {
          if (err) {
            rej(err);
            return;
          }
          if (event.participants.some(participant => participant.teamId === teamId)) {
            rej(new WrongArgumentsError('You are already registred'));
            return;
          }
          event.participants.push({
            teamId,
            botId,
            releaseId,
          });
          event.save((error) => {
            if (error) {
              rej(error);
              return;
            }
            res(event);
          });
        });
      },
      (error) => {
        rej(new ServiceUnavailableError(error));
      },
    );
  });
};

const mutation = {
  registerToEvent: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
