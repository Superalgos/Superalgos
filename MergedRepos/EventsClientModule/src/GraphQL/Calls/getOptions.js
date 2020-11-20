import gql from 'graphql-tag';
import { formulaInfo, plotterInfo } from '../Fragments';

const EVENTS_FORMULAS = gql`
  query Events_Formulas{
    events_Formulas {
      ...FormulaInfo
    }
  }
  ${formulaInfo}
`;

const EVENTS_PLOTTERS = gql`
  query Events_Plotters{
    events_Plotters {
      ...PlotterInfo
    }
  }
  ${plotterInfo}
`;

const EVENTS_CREATEFORMULA = gql`
  mutation Events_CreateFormula($formula: events_FormulaInput!) {
    events_CreateFormula(formula: $formula) {
      ...FormulaInfo
    }
  }
  ${formulaInfo}
`;

const EVENTS_CREATEPLOTTER = gql`
  mutation Events_CreatePlotter($plotter: events_PlotterInput!) {
    events_CreatePlotter(plotter: $plotter) {
      ...PlotterInfo
    }
  }
  ${plotterInfo}
`;

export default {
  EVENTS_PLOTTERS,
  EVENTS_FORMULAS,
  EVENTS_CREATEFORMULA,
  EVENTS_CREATEPLOTTER,
};
