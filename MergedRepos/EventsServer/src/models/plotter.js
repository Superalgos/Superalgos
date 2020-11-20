import mongoose, { Schema } from 'mongoose';

const plotterSchema = new Schema({
  ownerId: {
    type: String,
    required: true,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    required: true,
  },
  host: {
    type: String,
    required: true,
  },
  repo: {
    type: String,
    required: true,
  },
  moduleName: {
    type: String,
    required: true,
  },
});

const Plotter = mongoose.model('Plotter', plotterSchema);

export default Plotter;
