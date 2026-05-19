import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Video from '../models/Video.js';

export const listVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;
  const filter = { brandId: req.params.brandId };
  if (status) filter.status = status;
  if (search) filter.title  = { $regex: search, $options: 'i' };
  const skip = (Number(page) - 1) * Number(limit);
  const [videos, total] = await Promise.all([
    Video.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Video.countDocuments(filter),
  ]);
  res.status(200).json(new ApiResponse(200, { videos, total, page: Number(page), limit: Number(limit) }, 'Videos fetched'));
});

export const createVideo = asyncHandler(async (req, res) => {
  const video = await Video.create({
    ...req.body, brandId: req.params.brandId, createdBy: req.user._id,
    publishedAt: req.body.status === 'published' ? new Date() : null,
  });
  res.status(201).json(new ApiResponse(201, { video }, 'Video created'));
});

export const getVideo = asyncHandler(async (req, res) => {
  const video = await Video.findOne({ _id: req.params.id, brandId: req.params.brandId });
  if (!video) throw new ApiError(404, 'Video not found');
  res.status(200).json(new ApiResponse(200, { video }, 'Video fetched'));
});

export const updateVideo = asyncHandler(async (req, res) => {
  const update = { ...req.body };
  if (update.status === 'published') update.publishedAt = new Date();
  const video = await Video.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    update, { new: true, runValidators: true }
  );
  if (!video) throw new ApiError(404, 'Video not found');
  res.status(200).json(new ApiResponse(200, { video }, 'Video updated'));
});

export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findOneAndDelete({ _id: req.params.id, brandId: req.params.brandId });
  if (!video) throw new ApiError(404, 'Video not found');
  res.status(200).json(new ApiResponse(200, null, 'Video deleted'));
});

export const publishVideo = asyncHandler(async (req, res) => {
  const video = await Video.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    { status: 'published', publishedAt: new Date() }, { new: true }
  );
  if (!video) throw new ApiError(404, 'Video not found');
  res.status(200).json(new ApiResponse(200, { video }, 'Video published'));
});

export const unpublishVideo = asyncHandler(async (req, res) => {
  const video = await Video.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    { status: 'draft', publishedAt: null }, { new: true }
  );
  if (!video) throw new ApiError(404, 'Video not found');
  res.status(200).json(new ApiResponse(200, { video }, 'Video unpublished'));
});
