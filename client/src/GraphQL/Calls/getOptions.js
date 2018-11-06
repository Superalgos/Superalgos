import gql from 'graphql-tag';

const EVENTS_FORMULAS = gql`
  query Events_Formulas{
    events_Formulas {
      id
      ownerId
      isTemplate
      name
    }
  }
`;

const EVENTS_PLOTTERS = gql`
  query Events_Plotters{
    events_Plotters {
      id
      ownerId
      isTemplate
      name
      host
      repo
      moduleName
    }
  }
`;

export default {
  EVENTS_PLOTTERS,
  EVENTS_FORMULAS,
};
