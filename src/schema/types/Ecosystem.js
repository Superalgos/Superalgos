import {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} from 'graphql';

import { TeamType, EventHostType } from './index';

const EcosystemType = new GraphQLObjectType({
  name: 'Ecosystem',
  fields: () => ({
    id: { type: GraphQLID },
    authId: { type: GraphQLString },
    userName: { type: GraphQLString }, // TODO this field is temporary, it should be used the user module query
    devTeams: {
      type: new GraphQLList(TeamType),
      resolve(parent) {
        return parent.devTeams;
      }
    },
    hosts: {
      type: new GraphQLList(EventHostType),
      resolve(parent) {
        return parent.hosts;
      }
    }
  }),
});

export default EcosystemType;
