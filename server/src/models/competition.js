import mongoose, { Schema } from 'mongoose'

const competitionSchema = new Schema({
  codeName: String,
  displayName: String,
  host: String,
  description: String,
  startDatetime: Date,
  finishDatetime: Date,
  formula: String,
  plotter: {
    codeName: String,
    host: String,
    repo: String,
    moduleName: String
  },
  rules: [{
    number: Number,
    title: String,
    description: String
  }],
  prizes: [{
    position: Number,
    algoPrize: Number,
    otherPrizes: [{
      condition: String,
      amount: Number,
      asset: String
    }]
  }],
  participants: [{
    id: String,
    bot: String,
    release: String
  }]
})

const Competition = mongoose.model('Competition', competitionSchema)

export default Competition
