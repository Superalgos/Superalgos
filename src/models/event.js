import mongoose, { Schema } from 'mongoose';
import Plotter from './plotter';
import Formula from './formula';
import {
  UNPUBLISHED,
  EventStateEnum,
} from '../enums/EventState';
import {
  ENLISTED,
  ParticipantStateEnum,
} from '../enums/ParticipantState';
import {
  OTHER,
  HistoryTypeEnum,
} from '../enums/HistoryType';

const { ObjectId } = Schema.Types;

const eventSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  hostId: {
    type: String,
    required: true,
  },
  description: String,
  startDatetime: {
    type: Number,
    required: true,
  },
  endDatetime: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    enum: EventStateEnum,
    default: UNPUBLISHED,
  },
  history: [{
    date: {
      type: Number,
      required: true,
    },
    action: {
      data: String,
      type: {
        type: String,
        enum: HistoryTypeEnum,
        default: OTHER,
      },
      comment: String,
    },
  }],
  rules: [{
    title: {
      type: String,
      required: true,
    },
    description: String,
  }],
  rulesHistory: [{
    date: {
      type: Number,
      required: true,
    },
    action: {
      data: String,
      type: {
        type: String,
        enum: HistoryTypeEnum,
        default: OTHER,
      },
      comment: String,
    },
  }],
  prizes: [{
    condition: {
      from: Number,
      to: Number,
      additional: String,
    },
    pool: {
      amount: {
        type: Number,
        required: true,
      },
      asset: {
        type: String,
        required: true,
      },
    },
  }],
  prizesHistory: [{
    date: {
      type: Number,
      required: true,
    },
    action: {
      data: String,
      type: {
        type: String,
        enum: HistoryTypeEnum,
        default: OTHER,
      },
      comment: String,
    },
  }],
  participants: [{
    participantId: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      enum: ParticipantStateEnum,
      default: ENLISTED,
    },
    history: [{
      date: {
        type: Number,
        required: true,
      },
      action: {
        data: String,
        type: {
          type: String,
          enum: HistoryTypeEnum,
          default: OTHER,
        },
        comment: String,
      },
    }],
    operationId: String,
  }],
  invitations: [{
    inviteeId: {
      type: String,
      required: true,
    },
    acceptedDate: Number,
    refusedDate: Number,
    by: {
      date: Number,
      inviterId: {
        type: String,
        required: true,
      },
    },
  }],
  presentation: {
    banner: String,
    profile: String,
    page: String,
  },
  formulaId: {
    type: ObjectId,
    ref: Formula.modelName,
  },
  plotterId: {
    type: ObjectId,
    ref: Plotter.modelName,
  },
});

eventSchema.pre('find', function populate() {
  this.populate('formulaId').populate('plotterId');
});
eventSchema.pre('findOne', function populate() {
  this.populate('formulaId').populate('plotterId');
});
eventSchema.post('save', (doc, next) => {
  doc.populate('formulaId').populate('plotterId').execPopulate().then(() => {
    next();
  });
});
eventSchema.post('findOneAndUpdate', (doc, next) => {
  doc.populate('formulaId').populate('plotterId').execPopulate().then(() => {
    next();
  });
});

const Event = mongoose.model('Event', eventSchema);

export default Event;
