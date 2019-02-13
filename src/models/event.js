import mongoose, { Schema } from 'mongoose';
import Plotter from './plotter';
import Formula from './formula';
import {
  UNPUBLISHED,
  EventStateEnum,
} from '../enums/EventState';

const { ObjectId } = Schema.Types;

const eventSchema = new Schema({
  state: {
    type: String,
    enum: EventStateEnum,
    default: UNPUBLISHED,
  },
  name: {
    type: String,
    required: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  formulaId: {
    type: ObjectId,
    ref: Formula.modelName,
  },
  plotterId: {
    type: ObjectId,
    ref: Plotter.modelName,
  },
  prizes: [{
    rank: {
      type: String,
      required: true,
    },
    subPrize: [{
      condition: String,
    }],
  }],
});

eventSchema.pre('find', function populate() {
  this.populate('formulaId').populate('plotterId');
});
eventSchema.post('save', (doc, next) => {
  doc.populate('formulaId').populate('plotterId').execPopulate().then(() => {
    next();
  });
});
eventSchema.post('findOneAndUpdate', (doc, next) => {
  doc.populate('formulaId').populate('plotterId').execPopulate().then(() => {
    next();
  });
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
