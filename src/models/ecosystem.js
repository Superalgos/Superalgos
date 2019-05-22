const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const ecosystemSchema = new Schema({
  authId: {
    type: String,
    required: true
  },
  teams: [{
    codeName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    host:{
      url: {
        type: String,
        required: true
      },
      container: {
        type: String,
        required: true
      },
      accessKey: {
        type: String,
        required: true
      }
    },
    bots: [{
      repo: {
        type: String,
        required: true
      },
      configFile: {
        type: String,
        required: true
      }
    }],
    plotters: [{
      repo: {
        type: String,
        required: true
      },
      configFile: {
        type: String,
        required: true
      }
    }]
  }],
  hosts: [{
    codeName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    host:{
      url: {
        type: String,
        required: true
      },
      container: {
        type: String,
        required: true
      },
      accessKey: {
        type: String,
        required: true
      }
    },
    competitions: [{
      repo: {
        type: String,
        required: true
      },
      configFile: {
        type: String,
        required: true
      }
    }],
    plotters: [{
      repo: {
        type: String,
        required: true
      },
      configFile: {
        type: String,
        required: true
      }
    }]
  }]
})

const Ecosystem = mongoose.model('Ecosystem', ecosystemSchema);

export default Ecosystem;
