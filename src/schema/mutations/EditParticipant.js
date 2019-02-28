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
  { eventId: _id, participant: { keyId, participantId, botId } },
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
        if (!result.data.data.teams_TeamsByRole.some(team => team.id === participantId)) {
          rej(new WrongArgumentsError('You are not eligible to edit this team'));
          return;
        }
        Event.findOne({ _id }).exec((err, event) => {
          if (err) {
            rej(err);
            return;
          }
          const participantIndex = event.participant
            .findIndex(participant => participant.participantId === participantId);

          axios({
            url: process.env.GATEWAY_ENDPOINT,
            method: 'post',
            data: {
              query: `
                mutation {
                  operations_RemoveClone(id: "${event.participants[participantIndex].operationId}")
                }
              `,
            },
            headers: { authorization },
          }).then(
            () => {
              axios({
                url: process.env.GATEWAY_ENDPOINT,
                method: 'post',
                data: {
                  query: `
                    mutation {
                      operations_AddClone(
                        clone: {
                          botId: "${botId}"
                          botType: "Trading"
                          mode: "competition"
                          resumeExecution: false
                          runAsTeam: true
                          teamId: "${participantId}"
                          processName: "Trading-Process"
                          keyId: "${keyId}"
                          beginDatetime: ${event.startDatetime}
                          endDatetime: ${event.endDatetime}
                        }
                      ) {
                        id
                      }
                    }
                  `,
                },
                headers: { authorization },
              }).then(
                (operationCreation) => {
                  event.participants[participantIndex].operationId = operationCreation.data.data.operations_AddClone.id;
                  event.save((error) => {
                    if (error) {
                      rej(error);
                      return;
                    }
                    res(event);
                  });
                },
                (error) => {
                  rej(new ServiceUnavailableError(error));
                },
              );
            },
            (error) => {
              rej(new ServiceUnavailableError(error));
            },
          );
        });
      },
      (error) => {
        rej(new ServiceUnavailableError(error));
      },
    );
  });
};

const mutation = {
  editParticipant: {
    type: EventType,
    args,
    resolve,
  },
};

export default mutation;
