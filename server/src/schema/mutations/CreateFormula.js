import {
  GraphQLNonNull,
  GraphQLString,
} from 'graphql';
import { AuthentificationError } from '../../errors';
import { FormulaType } from '../types';
import { Formula } from '../../models';

const args = {
  name: { type: new GraphQLNonNull(GraphQLString) },
};

const resolve = (parent, { name }, context) => {
  const ownerId = context.userId;
  if (!ownerId) {
    throw new AuthentificationError();
  }
  const newFormula = new Formula({ name, ownerId });
  return new Promise((res, rej) => {
    newFormula.save((err) => {
      if (err) {
        rej(err);
        return;
      }
      res(newFormula);
    });
  });
};

const mutation = {
  createFormula: {
    type: FormulaType,
    args,
    resolve,
  },
};

export default mutation;
