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

module.exports = mongoose.model('User', userSchema);
