const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  authId: String,
  alias: String,
  firstName:String,
  lastName: String,
  isDeveloper: Boolean,
  isTrader: Boolean,
  isDataAnalyst: Boolean,
  roleId: String
})

global.UserSchema = global.UserSchema || mongoose.model('User', userSchema);
module.exports = global.UserSchema;
