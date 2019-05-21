import mongoose, { Schema } from 'mongoose';

const tradingSystemSchema = new Schema(
  {
    fbSlug: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
    },
    strategies: [{
      active: {
        type: Boolean,
        required: true,
        default: true,
      },
      name: {
        type: String,
        default: '',
      },
      filter: Object,
      triggerStage: Object,
      openStage: Object,
      manageStage: Object,
      closeStage: Object,
    }],
    history: [{
      updatedAt: Date,
      strategies: [{
        active: {
          type: Boolean,
          required: true,
          default: true,
        },
        name: {
          type: String,
          default: '',
        },
        filter: Object,
        triggerStage: Object,
        openStage: Object,
        manageStage: Object,
        closeStage: Object,
      }],
    }],
  },
  {
    timestamps: true,
  },
);

const TradingSystem = mongoose.model('TradingSystem', tradingSystemSchema);

export default TradingSystem;
