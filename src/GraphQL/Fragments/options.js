import gql from 'graphql-tag';

export const plotterInfo = gql`
  fragment PlotterInfo on events_Plotter {
    id
    ownerId
    isTemplate
    name
    host
    repo
    moduleName
  }
`;

export const formulaInfo = gql`
  fragment FormulaInfo on events_Formula {
    id
    ownerId
    isTemplate
    name
  }
`;
