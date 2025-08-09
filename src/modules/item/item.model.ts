// item.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface IItem {
  owner: Types.ObjectId;
  folder?: Types.ObjectId | null;
  name: string;
  type: "pdf" | "image" | "other";
  size: number;
  url: string;
  favorite?: boolean;
  sharedWith?: Types.ObjectId[];
}

export interface IItemDocument extends IItem, Document {}

const itemSchema = new Schema<IItemDocument>(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    folder: { type: Schema.Types.ObjectId, ref: "Folder" },
    name: { type: String, required: true },
    type: { type: String, enum: ["pdf", "image", "other"], required: true },
    size: { type: Number, required: true },
    url: { type: String, required: true },
    favorite: { type: Boolean, default: false },
    sharedWith: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export const Item = model<IItemDocument>("Item", itemSchema);
