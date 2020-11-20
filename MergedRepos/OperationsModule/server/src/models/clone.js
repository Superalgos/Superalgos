import mongoose, { Schema } from 'mongoose'

import {
  UNPUBLISHED,
  CloneStateEnum
} from '../enums/CloneState'

import {
  BACKTEST,
  CloneModeEnum
} from '../enums/CloneMode'

const cloneSchema = new Schema({
  authId: {
    type: String,
    required: true
  },
  teamId: {
    type: String,
    required: true
  },
  botId: {
    type: String,
    required: true
  },
  keyId: String,
  mode: {
    type: String,
    enum: CloneModeEnum,
    default: BACKTEST
  },
  resumeExecution: Boolean,
  beginDatetime: Number,
  endDatetime: Number,
  waitTime: Number,
  state: {
    type: String,
    enum: CloneStateEnum,
    default: UNPUBLISHED
  },
  stateDatetime: Number,
  createDatetime: Number,
  active: Boolean,
  summaryDate: Number,
  buyAverage: Number,
  sellAverage: Number,
  marketRate: Number,
  combinedProfitsA: Number,
  combinedProfitsB: Number,
  assetA: String,
  assetB: String,
  processName: {
    type: String,
    required: true
  },
  exchangeName: String,
  timePeriod: String,
  balanceAssetA: Number,
  balanceAssetB: Number

})

const Clone = mongoose.model('Clone', cloneSchema)

export default Clone
