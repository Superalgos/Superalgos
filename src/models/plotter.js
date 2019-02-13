import mongoose, { Schema } from 'mongoose';

const plotterSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

const Plotter = mongoose.model('Plotter', plotterSchema);

export default Plotter;
