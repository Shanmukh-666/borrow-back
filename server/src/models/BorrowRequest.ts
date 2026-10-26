import mongoose, { Document, Schema, Types } from 'mongoose';

export const REQUEST_STATUSES = [
  'pending',
  'approved',
  'rejected',
  'cancelled',
  'borrowed',
  'return_pending',
  'completed',
] as const;

export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export interface IBorrowRequest extends Document {
  item: Types.ObjectId;
  owner: Types.ObjectId;
  borrower: Types.ObjectId;
  startDate: string; // YYYY-MM-DD normalized date
  endDate: string; // YYYY-MM-DD normalized date
  message?: string;
  status: RequestStatus;
  pickupConfirmations: {
    owner: boolean;
    borrower: boolean;
  };
  returnConfirmations: {
    owner: boolean;
    borrower: boolean;
  };
  pickupConditionNotes: {
    owner?: string;
    borrower?: string;
  };
  returnConditionNotes: {
    owner?: string;
    borrower?: string;
  };
  borrowedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const borrowRequestSchema = new Schema<IBorrowRequest>(
  {
    item: {
      type: Schema.Types.ObjectId,
      ref: 'Item',
      required: [true, 'Item is required'],
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
      index: true,
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Borrower is required'],
      index: true,
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'],
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'],
    },
    message: {
      type: String,
      trim: true,
      maxlength: [300, 'Message cannot exceed 300 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: 'pending',
      index: true,
    },
    pickupConfirmations: {
      owner: { type: Boolean, default: false },
      borrower: { type: Boolean, default: false },
    },
    returnConfirmations: {
      owner: { type: Boolean, default: false },
      borrower: { type: Boolean, default: false },
    },
    pickupConditionNotes: {
      owner: { type: String, trim: true, maxlength: 300 },
      borrower: { type: String, trim: true, maxlength: 300 },
    },
    returnConditionNotes: {
      owner: { type: String, trim: true, maxlength: 300 },
      borrower: { type: String, trim: true, maxlength: 300 },
    },
    borrowedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        ret.id = ret._id?.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

borrowRequestSchema.index({ item: 1, status: 1, startDate: 1, endDate: 1 });
borrowRequestSchema.index({ borrower: 1, createdAt: -1 });
borrowRequestSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const BorrowRequest = mongoose.model<IBorrowRequest>('BorrowRequest', borrowRequestSchema);
