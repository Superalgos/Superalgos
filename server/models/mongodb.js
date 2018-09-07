const mongoose = require('mongoose');

const UserSchema = require('./User');

class UserMongo {
  addUser({ authId, alias }) {
    return UserSchema.create({
      authId: String,
      alias: String,
    });
  }
}

module.exports = UserMongo;
