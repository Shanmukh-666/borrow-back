import mongoose, { Document, Schema, Types } from 'mongoose';

export const ITEM_CATEGORIES = [
  'Books & Study',
  'Electronics',
  'Tools & DIY',
  'Sports & Outdoors',
  'Home & Kitchen',
  'Event & Presentation',
  'Other',
] as const;

export type ItemCategory = (typeof ITEM_CATEGORIES)[number];

export const ITEM_CONDITIONS = ['New', 'Like New', 'Good', 'Fair'] as const;
export type ItemCondition = (typeof ITEM_CONDITIONS)[number];

export const ITEM_STATUSES = ['active', 'archived'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export interface IItem extends Document {
  owner: Types.ObjectId;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  pickupNote?: string;
  imageUrl?: string;
  status: ItemStatus;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Item owner is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [80, 'Title cannot exceed 80 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ITEM_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    condition: {
      type: String,
      required: [true, 'Condition is required'],
      enum: {
        values: ITEM_CONDITIONS,
        message: '{VALUE} is not a valid condition',
      },
    },
    pickupNote: {
      type: String,
      trim: true,
      maxlength: [100, 'Pickup note cannot exceed 100 characters'],
      default: '',
    },
    imageUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Image URL cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ITEM_STATUSES,
      default: 'active',
      index: true,
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

itemSchema.index({ status: 1, createdAt: -1 });
itemSchema.index({ category: 1, status: 1 });
itemSchema.index({ owner: 1, status: 1, createdAt: -1 });

export const Item = mongoose.model<IItem>('Item', itemSchema);
