import {
  GraphQLNonNull,
  GraphQLString
} from 'graphql'
import { AuthentificationError } from '../../errors'
import { FormulaType } from '../types'
import { Formula } from '../../models'

const args = {
  name: { type: new GraphQLNonNull(GraphQLString) }
}

const resolve = (parent, { name }, context) => {
  const ownerId = context.userId
  if (!ownerId) {
    throw new AuthentificationError()
  }
  let newFormula = new Formula({ name, ownerId })
  return new Promise((resolve, reject) => {
    newFormula.save((err) => {
      if (err) reject(err)
      else {
        resolve(newFormula)
      }
    })
  })
}

const mutation = {
  createFormula: {
    type: FormulaType,
    args,
    resolve
  }
}

export default mutation
