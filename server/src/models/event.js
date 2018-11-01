import mongoose, { Schema } from 'mongoose';
import Plotter from './plotter';
import Formula from './formula';
import {
  UNPUBLISHED,
  EventStatusEnum,
} from '../enums/EventStatus';

const eventSchema = new Schema({
  designator: { type: String, required: true },
  status: { type: String, enum: EventStatusEnum, default: UNPUBLISHED },
  name: { type: String, required: true },
  hostId: { type: String, required: true },
  description: String,
  startDatetime: { type: Number, required: true },
  finishDatetime: { type: Number, required: true },
  formula: { type: Schema.Types.ObjectId, ref: Formula.modelName },
  plotter: { type: Schema.Types.ObjectId, ref: Plotter.modelName },
  rules: [{
    position: { type: Number, required: true },
    title: { type: String, required: true },
    description: String,
  }],
  prizes: [{
    rank: { type: Number, required: true },
    amount: { type: Number, required: true },
    additional: [{
      condition: String,
      amount: { type: Number, required: true },
      asset: { type: String, required: true },
    }],
  }],
  participants: [{
    teamId: { type: String, required: true },
    botId: String,
    releaseId: String,
  }],
});

eventSchema.pre('find', function populate() {
  this.populate('formula').populate('plotter');
});
eventSchema.post('save', (doc, next) => {
  doc.populate('formula').populate('plotter').execPopulate().then(() => {
    next();
  });
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
