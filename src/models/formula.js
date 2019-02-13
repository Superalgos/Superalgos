import mongoose, { Schema } from 'mongoose';

const formulaSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Formula = mongoose.model('Formula', formulaSchema);

export default Formula;
