import { Folder } from './folder.model';
import { Item } from '../item/item.model';
import httpStatus from 'http-status';

export const createFolder = async (req, res) => {
  const userId = (req as any).user.id;
  const { name, parent } = req.body;
  const folder = await Folder.create({ name, owner: userId, parent: parent || null });
  res.status(httpStatus.CREATED).json({ success:true, data: folder });
};

export const listFolders = async (req, res) => {
  const userId = (req as any).user.id;
  const folders = await Folder.find({ owner: userId }).lean();
  // get size per folder
  const folderSizes = await Item.aggregate([
    { $match: { owner: new (require('mongoose').Types.ObjectId)(userId), folder: { $ne: null } } },
    { $group: { _id: '$folder', total: { $sum: '$size' }, count: { $sum: 1 } } }
  ]);
  // merge counts with folders
  const map = folderSizes.reduce((acc, cur) => { acc[cur._id.toString()] = cur; return acc; }, {});
  const result = folders.map(f => ({ ...f, totalBytes: map[f._id.toString()]?.total || 0, itemCount: map[f._id.toString()]?.count || 0 }));
  res.json({ success:true, data: result });
};
