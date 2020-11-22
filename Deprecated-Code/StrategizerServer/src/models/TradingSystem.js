import mongoose, { Schema } from 'mongoose';

const tradingSystemSchema = new Schema(
  {
    fbSlug: {
      type: String,
      required: true,
      unique: true,
      dropDups: true,
    },
    data: Object,
    history: [{
      updatedAt: Date,
      data: Object,
    }],
  },
  {
    timestamps: true,
  },
);

const TradingSystem = mongoose.model('TradingSystem', tradingSystemSchema);

export default TradingSystem;
