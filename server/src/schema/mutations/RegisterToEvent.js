import 'dotenv/config';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
} from 'graphql';
import axios from 'axios';
import {
  AuthentificationError,
  WrongArgumentsError,
  ServiceUnavailableError,
} from '../../errors';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  designator: { type: new GraphQLNonNull(GraphQLID) },
  teamId: { type: new GraphQLNonNull(GraphQLString) },
  botId: { type: GraphQLString },
  releaseId: { type: GraphQLString },
};

const resolve = (parent, {
  designator, teamId, botId, releaseId,
}, context) => {
  const userid = context.userId;
  if (!userid) {
    throw new AuthentificationError();
  }
  return new Promise((res, rej) => {
    axios({
      url: process.env.TEAMS_ENDPOINT,
      method: 'post',
      data: {
        query: `
          {
            teamsByRole{
              id
            }
          }
        `,
      },
      headers: {
        userid,
        authorization: context.authorization,
      },
    }).then(
      (result) => {
        if (!result.data.data.teamsByRole.some(team => team.id === teamId)) {
          rej(new WrongArgumentsError('You are not eligible to register this team'));
          return;
        }
        Event.findOne({ designator }).exec((err, event) => {
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
