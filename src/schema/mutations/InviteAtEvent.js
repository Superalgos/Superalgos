import 'dotenv/config';
import {
  GraphQLNonNull,
  GraphQLID,
  GraphQLString,
} from 'graphql';
import {
  AuthentificationError,
  WrongArgumentsError,
} from '../../errors';
import { epoch } from '../../utils/functions';
import { EventType } from '../types';
import { Event } from '../../models';

const args = {
  eventId: { type: new GraphQLNonNull(GraphQLID) },
  inviteeId: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent,
  { eventId: _id, inviteeId },
  { userId }) => {
  if (!userId) {
    throw new AuthentificationError();
  }
  return new Promise((res, rej) => {
    Event.findOne({ _id }).exec((err, event) => {
      if (err) {
        rej(err);
        return;
      }
      if (event.invitations.some(invitee => invitee.inviteeId === inviteeId)) {
        rej(new WrongArgumentsError('This user is already invited'));
        return;
      }
      event.invitations.push({
        inviteeId,
        by: {
          inviterId: userId,
          date: epoch(),
        },
      });
      event.save((error) => {
        if (error) {
          rej(error);
          return;
        }
        res(event);
      });
    });
  });
};

const mutation = {
  inviteAtEvent: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
