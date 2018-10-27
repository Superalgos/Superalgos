import mongoose, { Schema } from 'mongoose'

const plotterSchema = new Schema({
  ownerId: String,
  isTemplate: Boolean,
  name: String,
  host: String,
  repo: String,
  moduleName: String
})

const Plotter = mongoose.model('Plotter', plotterSchema)

export default Plotter
