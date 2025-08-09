import httpStatus from 'http-status';
import { User } from './user.model';
import bcrypt from 'bcryptjs';

export const editProfile = async (req, res) => {
  const userId = (req as any).user.id;
  const { username } = req.body;
  const image = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;

  const update: any = {};
  if (username) update.username = username;
  if (image) update.image = image;

  const user = await User.findByIdAndUpdate(userId, update, { new: true }).select('-password');
  res.status(httpStatus.OK).json({ success:true, data: user });
};

export const changePassword = async (req, res) => {
  const userId = (req as any).user.id;
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (newPassword !== confirmPassword) return res.status(400).json({ success:false, message:'Passwords do not match' });

  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ success:false, message:'User not found' });

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) return res.status(401).json({ success:false, message:'Old password incorrect' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ success:true, message:'Password changed' });
};

export const deleteAccount = async (req, res) => {
  const userId = (req as any).user.id;
  // delete items, folders, storage
  await require('../item/item.model').Item.deleteMany({ owner: userId });
  await require('../folder/folder.model').Folder.deleteMany({ owner: userId });
  await require('../storage/storage.model').Storage.deleteOne({ user: userId });
  await User.findByIdAndDelete(userId);
  res.json({ success:true, message:'Account deleted' });
};
