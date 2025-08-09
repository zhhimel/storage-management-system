import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Item } from './item.model';
import { Storage } from '../storage/storage.model';
import { Folder } from '../folder/folder.model';
import fs from 'fs';
import path from 'path';

// Upload handler: file is available at req.file via multer
export const uploadFile = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const file = (req as any).file;
  const folderId = req.body.folderId || null;
  if (!file) return res.status(400).json({ success:false, message:'No file' });

  const ext = path.extname(file.filename).toLowerCase();
  const type = ext === '.pdf' ? 'pdf' : ext.match(/\.(jpg|jpeg|png|gif)$/) ? 'image' : 'other';

  const item = await Item.create({
    owner: userId,
    folder: folderId,
    name: req.body.name || file.originalname,
    type,
    size: file.size,
    url: `/uploads/${file.filename}`
  });

  // update storage
  const storage = await Storage.findOneAndUpdate({ user: userId }, {
    $inc: { usedBytes: file.size, 'byType.images': type === 'image' ? file.size : 0, 'byType.pdfs': type === 'pdf' ? file.size : 0 }
  }, { new: true, upsert: true });

  res.status(httpStatus.CREATED).json({ success:true, data: item });
};

export const favoriteItem = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const item = await Item.findOneAndUpdate({ _id: itemId, owner: userId }, { $set: { favorite: true } }, { new: true });
  if (!item) return res.status(404).json({ success:false, message:'Not found' });
  res.json({ success:true, data: item });
};

export const renameItem = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const { name } = req.body;
  const item = await Item.findOneAndUpdate({ _id: itemId, owner: userId }, { $set: { name } }, { new: true });
  if (!item) return res.status(404).json({ success:false, message:'Not found' });
  res.json({ success:true, data: item });
};

export const duplicateItem = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const item = await Item.findOne({ _id: itemId, owner: userId });
  if (!item) return res.status(404).json({ success:false, message:'Not found' });

  // Duplicate record; if file exists on disk you might copy the file too (here we just duplicate DB record pointing to same url)
  const copy = await Item.create({
    owner: userId,
    folder: item.folder,
    name: `${item.name} (copy)`,
    type: item.type,
    size: item.size,
    url: item.url
  });

  // update storage usedBytes if you physically duplicate file (if not, skip)
  // await Storage.findOneAndUpdate({ user: userId }, { $inc: { usedBytes: item.size } });

  res.status(httpStatus.CREATED).json({ success:true, data: copy });
};

export const deleteItem = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const item = await Item.findOneAndDelete({ _id: itemId, owner: userId });
  if (!item) return res.status(404).json({ success:false, message:'Not found' });

  // update storage
  await Storage.findOneAndUpdate({ user: userId }, {
    $inc: { usedBytes: -item.size, 'byType.images': item.type === 'image' ? -item.size : 0, 'byType.pdfs': item.type === 'pdf' ? -item.size : 0 }
  });

  // optionally remove file from disk
  if (item.url && item.url.startsWith('/uploads/')) {
    const filepath = path.join(process.cwd(), item.url);
    fs.unlink(filepath, err => { if (err) console.warn('unlink error', err); });
  }
  res.json({ success:true, message:'Deleted' });
};

export const shareItem = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { itemId } = req.params;
  const { targetUserId } = req.body;
  const item = await Item.findOneAndUpdate({ _id: itemId, owner: userId }, { $addToSet: { sharedWith: targetUserId } }, { new: true });
  if (!item) return res.status(404).json({ success:false, message:'Not found' });
  res.json({ success:true, data: item });
};
