import mongoose, { Schema } from 'mongoose'

const formulaSchema = new Schema({
  ownerId: String,
  isTemplate: Boolean,
  name: String
})

const Formula = mongoose.model('Formula', formulaSchema)

export default Formula
