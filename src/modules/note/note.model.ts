import mongoose, { Schema, Types, Document, Model } from 'mongoose';

export interface INote extends Document {
  owner: Types.ObjectId;
  title?: string;
  content: string;
  folder?: Types.ObjectId | null;
}

const NoteSchema = new Schema<INote>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },
    content: { type: String, default: '' },
    folder: { type: Schema.Types.ObjectId, ref: 'Folder', default: null },
  },
  { timestamps: true }
);

export const Note: Model<INote> = mongoose.model<INote>('Note', NoteSchema);
