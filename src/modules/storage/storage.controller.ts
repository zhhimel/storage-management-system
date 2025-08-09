import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { Storage } from './storage.model';
import { Folder } from '../folder/folder.model';
import { Item } from '../item/item.model';
import { pushRecentSearch, getRecentSearches } from '../../utils/redis';

export const getDashboard = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  // storage doc (create if not exists)
  let storage = await Storage.findOne({ user: userId });
  if (!storage) {
    storage = await Storage.create({ user: userId });
  }

  // counts
  const foldersCount = await Folder.countDocuments({ owner: userId });
  const imagesCount = await Item.countDocuments({ owner: userId, type: 'image' });
  const pdfCount = await Item.countDocuments({ owner: userId, type: 'pdf' });

  // storage usage by type
  const imagesSizeAgg = await Item.aggregate([
    { $match: { owner: storage.user, type: 'image' } },
    { $group: { _id: null, total: { $sum: '$size' } } }
  ]);

  const imagesBytes = imagesSizeAgg[0]?.total || 0;
  const pdfSizeAgg = await Item.aggregate([
    { $match: { owner: storage.user, type: 'pdf' } },
    { $group: { _id: null, total: { $sum: '$size' } } }
  ]);
  const pdfBytes = pdfSizeAgg[0]?.total || 0;

  const recentSearches = await getRecentSearches(userId);

  res.status(httpStatus.OK).json({
    success: true,
    data: {
      storage: {
        totalBytes: storage.totalBytes,
        usedBytes: storage.usedBytes,
        availableBytes: Math.max(0, storage.totalBytes - storage.usedBytes),
      },
      counts: {
        folders: foldersCount,
        images: imagesCount,
        pdfs: pdfCount,
      },
      byType: {
        imagesBytes,
        pdfBytes,
      },
      recentSearches
    }
  });
};

// search API
export const searchItems = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { q } = req.query;
  if (!q || typeof q !== 'string') return res.status(400).json({ success:false, message: 'Query required' });

  // push recent search
  await pushRecentSearch(userId, q);

  const items = await Item.find({
    owner: userId,
    name: { $regex: q, $options: 'i' }
  }).limit(50);

  res.json({ success: true, data: items });
};
