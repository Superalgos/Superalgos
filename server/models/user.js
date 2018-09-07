const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
<<<<<<< HEAD
authId: String,
alias: String,
firstName:String,
middleName:String,
lastName: String,
email: String,
emailVerified: Boolean,
isDeveloper: Boolean,
isTrader: Boolean,
isDataAnalyst: Boolean,
roleId: String
=======
  authId: String,
  alias: String,
  firstName:String,
  lastName: String,
  isDeveloper: Boolean,
  isTrader: Boolean,
  isDataAnalyst: Boolean,
  roleId: String
>>>>>>> feature/integrate-Auth0
})

global.UserSchema = global.UserSchema || mongoose.model('User', userSchema);
module.exports = global.UserSchema;
