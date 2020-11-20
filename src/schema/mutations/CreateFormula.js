import { AuthentificationError } from '../../errors';
import { FormulaType } from '../types';
import { Formula } from '../../models';
import { FormulaInputType } from '../types/input';

const args = {
  formula: { type: FormulaInputType },
};

const resolve = (parent, { formula }, { userId: ownerId }) => {
  if (!ownerId) {
    throw new AuthentificationError();
  }

  formula.ownerId = ownerId;
  const newFormula = new Formula(formula);

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
