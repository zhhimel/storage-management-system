import { Schema, model, Document, Types } from "mongoose";

export interface IFolder {
  name: string;
  userId: Types.ObjectId;
  size: number;
}

export interface IFolderDocument extends IFolder, Document {}

const folderSchema = new Schema<IFolderDocument>({
  name: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  size: { type: Number, default: 0 }
}, { timestamps: true });

export const Folder = model<IFolderDocument>("Folder", folderSchema);
