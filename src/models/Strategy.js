import mongoose, { Schema } from 'mongoose';

const strategySchema = new Schema(
  {
    fbSlug: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
    },
    subStrategies: [{
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
    history: [{
      updatedAt: Date,
      subStrategies: [{
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
    }],
  },
  {
    timestamps: true,
  },
);

const Strategy = mongoose.model('Strategy', strategySchema);

export default Strategy;
