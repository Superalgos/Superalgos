import {
  GraphQLList,
} from 'graphql';
import { FormulaType } from '../types';
import { Formula } from '../../models';

const args = {};

const resolve = () => Formula.find();

const query = {
  formulas: {
    type: new GraphQLList(FormulaType),
    args,
    resolve,
  },
};

export default query;
