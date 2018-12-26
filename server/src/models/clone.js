import mongoose, { Schema } from 'mongoose'

import {
  UNPUBLISHED,
  CloneStateEnum,
} from '../enums/CloneState';

import {
  BACKTEST,
  CloneModeEnum,
} from '../enums/CloneMode';

const cloneSchema = new Schema({
  authId: {
    type: String,
    required: true,
  },
  teamId: {
      type: String,
      required: true,
  },
  botId: {
      type: String,
      required: true,
  },
  mode: {
    type: String,
    enum: CloneModeEnum,
    default: BACKTEST,
  },
  resumeExecution: Boolean,
  beginDatetime: Number,
  endDatetime: Number,
  waitTime: Number,
  state: {
    type: String,
    enum: CloneStateEnum,
    default: UNPUBLISHED,
  },
  stateDatetime: Number,
  createDatetime: Number,
  runAsTeam: Boolean
})

const Clone = mongoose.model('Clone', cloneSchema)

export default Clone
