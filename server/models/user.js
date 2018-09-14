const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  authId: String,
  alias: String,
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  emailVerified: Boolean,
  bio: String,
  isDeveloper: Boolean,
  isTrader: Boolean,
  isDataAnalyst: Boolean,
  roleId: String
})

global.UserSchema = global.UserSchema || mongoose.model('User', userSchema)
module.exports = global.UserSchema
