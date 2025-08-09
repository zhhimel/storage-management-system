import mongoose, { Schema, Types, Document, Model } from 'mongoose';

export interface IStorage extends Document {
  user: Types.ObjectId;
  totalBytes: number;
  usedBytes: number;
  byType: {
    images: number;
    pdfs: number;
    other: number;
  };
}

const StorageSchema = new Schema<IStorage>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalBytes: { type: Number, default: 15 * 1024 * 1024 * 1024 }, // 15 GB
    usedBytes: { type: Number, default: 0 },
    byType: {
      images: { type: Number, default: 0 },
      pdfs: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const Storage: Model<IStorage> = mongoose.model<IStorage>('Storage', StorageSchema);
