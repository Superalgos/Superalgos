/*
This is how Users are added to the User collection on Mongo DB.
Note that only the authId and alias is saved during user creation.
This means that this should only be executed from within the authentication
process.
*/

const mongoose = require('mongoose')

const UserSchema = require('../../models/User')

class UserMongo {
  addUser ({ authId, alias }) {
    return UserSchema.create({
      authId: String,
      alias: String
    })
  }
}

module.exports = UserMongo
