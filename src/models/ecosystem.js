const mongoose = require('mongoose')
const { Schema } = require('mongoose')

const ecosystemSchema = new Schema({
  authId: {
    type: String,
    required: true
  },
  devTeams: [{
    codeName: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true
    },
    host: {
      url: {
        type: String,
        required: true
      },
      storage: {
        type: String,
        required: true
      },
      container: {
        type: String,
        required: true
      },
      accessKey: {
        type: String,
        required: false
      }
    },
    bots: [{
      codeName: {
        type: String,
        required: true
      },
      displayName: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      profilePicture: {
        type: String,
        required: true
      },
      repo: {
        type: String,
        required: false
      },
      configFile: {
        type: String,
        required: false
      },
      cloneId: {
        type: String,
        required: false
      },
      products: [{
        codeName: {
          type: String,
          required: true
        },
        displayName: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: true
        },
        dataSets: [{
          codeName: {
            type: String,
            required: true
          },
          type: {
            type: String,
            required: true
          },
          validPeriods: [{
            type: String,
            required: true
          }],
          filePath: {
            type: String,
            required: true
          },
          fileName: {
            type: String,
            required: true
          },
          dataRange: {
            filePath: {
              type: String,
              required: false
            },
            fileName: {
              type: String,
              required: false
            },
          },
        }],
        exchangeList: [{
          name: {
            type: String,
            required: true
          }
        }],
        plotter: {
          codeName: {
            type: String,
            required: false
          },
          devTeam: {
            type: String,
            required: false
          },
          moduleName: {
            type: String,
            required: true
          },
        }
      }]
    }],
    plotters: [{
      codeName: {
        type: String,
        required: true
      },
      displayName: {
        type: String,
        required: true
      },
      modules: [{
        codeName: {
          type: String,
          required: true
        },
        moduleName: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: false
        },
        profilePicture: {
          type: String,
          required: false
        },
        panels: [{
          codeName: {
            type: String,
            required: true
          },
          moduleName: {
            type: String,
            required: true
          },
          event: {
            type: String,
            required: true
          }
        }],
      }],
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
    host: {
      url: {
        type: String,
        required: true
      },
      storage: {
        type: String,
        required: true
      },
      container: {
        type: String,
        required: true
      },
      accessKey: {
        type: String,
        required: false
      }
    },
    competitions: [{
      codeName: {
        type: String,
        required: true
      },
      displayName: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: false
      },
      startDatetime: {
        type: String,
        required: false
      },
      finishDatetime: {
        type: String,
        required: false
      },
      formula: {
        type: String,
        required: false
      },
      plotter: {
        devTeam: {
          type: String,
          required: true
        },
        codeName: {
          type: String,
          required: true
        },
        host: {
          url: {
            type: String,
            required: true
          },
          storage: {
            type: String,
            required: true
          },
          container: {
            type: String,
            required: true
          },
          accessKey: {
            type: String,
            required: false
          }
        },
        repo: {
          type: String,
          required: true
        },
        moduleName: {
          type: String,
          required: true
        },
      },
      participants: [{
        type: String,
        required: false
      }],
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
      codeName: {
        type: String,
        required: true
      },
      displayName: {
        type: String,
        required: true
      },
      modules: [{
        codeName: {
          type: String,
          required: true
        },
        moduleName: {
          type: String,
          required: true
        },
        description: {
          type: String,
          required: false
        },
        profilePicture: {
          type: String,
          required: false
        },
        panels: [{
          codeName: {
            type: String,
            required: true
          },
          moduleName: {
            type: String,
            required: true
          },
          event: {
            type: String,
            required: true
          }
        }],
      }],
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
