import mongoose, { Schema } from 'mongoose'
import Plotter from './plotter'
import Formula from './formula'

const eventSchema = new Schema({
  designator: String,
  name: String,
  hostId: String,
  description: String,
  startDatetime: Number,
  finishDatetime: Number,
  formula: { type: Schema.Types.ObjectId, ref: Formula.modelName },
  plotter: { type: Schema.Types.ObjectId, ref: Plotter.modelName },
  rules: [{
    position: Number,
    title: String,
    description: String
  }],
  prizes: [{
    rank: Number,
    amount: Number,
    additional: [{
      condition: String,
      amount: Number,
      asset: String
    }]
  }],
  participants: [{
    teamId: String,
    botId: String,
    releaseId: String
  }]
})

eventSchema.pre('find', function () {
  this.populate('formula').populate('plotter')
})
eventSchema.post('save', function (doc, next) {
  doc.populate('formula').populate('plotter').execPopulate().then(function () {
    next()
  })
})

const Event = mongoose.model('Event', eventSchema)

export default Event
