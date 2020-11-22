import mongoose, { Schema } from 'mongoose';

const formulaSchema = new Schema({
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
});

const Formula = mongoose.model('Formula', formulaSchema);

export default Formula;
