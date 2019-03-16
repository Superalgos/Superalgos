import mongoose, { Schema } from 'mongoose';

const strategySchema = new Schema({
  fbId: {
    type: String,
    required: true,
  },
  strategies: [{
    name: {
      type: String,
      default: '',
    },
    entryPoint: {
      situations: [{
        name: {
          type: String,
          default: '',
        },
        conditions: [{
          name: {
            type: String,
            default: '',
          },
          code: {
            type: String,
            default: 'false',
          },
        }],
      }],
    },
    exitPoint: {
      situations: [{
        name: {
          type: String,
          default: '',
        },
        conditions: [{
          name: {
            type: String,
            default: '',
          },
          code: {
            type: String,
            default: 'false',
          },
        }],
      }],
    },
    sellPoint: {
      situations: [{
        name: {
          type: String,
          default: '',
        },
        conditions: [{
          name: {
            type: String,
            default: '',
          },
          code: {
            type: String,
            default: 'false',
          },
        }],
      }],
    },
    buyPoint: {
      situations: [{
        name: {
          type: String,
          default: '',
        },
        conditions: [{
          name: {
            type: String,
            default: '',
          },
          code: {
            type: String,
            default: 'false',
          },
        }],
      }],
    },
    stopLoss: {
      phases: [{
        name: {
          type: String,
          default: '',
        },
        code: {
          type: String,
          default: 'false',
        },
        situations: [{
          name: {
            type: String,
            default: '',
          },
          conditions: [{
            name: {
              type: String,
              default: '',
            },
            code: {
              type: String,
              default: 'false',
            },
          }],
        }],
      }],
    },
    buyOrder: {
      phases: [{
        name: {
          type: String,
          default: '',
        },
        code: {
          type: String,
          default: 'false',
        },
        situations: [{
          name: {
            type: String,
            default: '',
          },
          conditions: [{
            name: {
              type: String,
              default: '',
            },
            code: {
              type: String,
              default: 'false',
            },
          }],
        }],
      }],
    },
    sellOrder: {
      phases: [{
        name: {
          type: String,
          default: '',
        },
        code: {
          type: String,
          default: 'false',
        },
        situations: [{
          name: {
            type: String,
            default: '',
          },
          conditions: [{
            name: {
              type: String,
              default: '',
            },
            code: {
              type: String,
              default: 'false',
            },
          }],
        }],
      }],
    },
  }],
});

const Strategy = mongoose.model('Strategy', strategySchema);

export default Strategy;
