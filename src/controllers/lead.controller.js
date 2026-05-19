import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import Lead from '../models/Lead.js';
import LeadActivity from '../models/LeadActivity.js';
import LeadNote from '../models/LeadNote.js';

export const listLeads = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, intent, search } = req.query;
  const filter = { brandId: req.params.brandId };
  if (status) filter.status = status;
  if (intent) filter.intent = intent;
  if (search) filter.$or = [
    { name:    { $regex: search, $options: 'i' } },
    { email:   { $regex: search, $options: 'i' } },
    { company: { $regex: search, $options: 'i' } },
  ];
  const skip = (Number(page) - 1) * Number(limit);
  const [leads, total] = await Promise.all([
    Lead.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Lead.countDocuments(filter),
  ]);
  res.status(200).json(new ApiResponse(200, { leads, total, page: Number(page), limit: Number(limit) }, 'Leads fetched'));
});

export const createLead = asyncHandler(async (req, res) => {
  const lead = await Lead.create({ ...req.body, brandId: req.params.brandId });
  await LeadActivity.create({
    leadId: lead._id, type: 'signup',
    description: `Lead created via ${lead.sourceType}`,
    performedBy: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, { lead }, 'Lead created'));
});

export const getLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, brandId: req.params.brandId })
    .populate('sourcePageId', 'title slug')
    .populate('sourceVideoId', 'title');
  if (!lead) throw new ApiError(404, 'Lead not found');
  res.status(200).json(new ApiResponse(200, { lead }, 'Lead fetched'));
});

export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    req.body, { new: true, runValidators: true }
  );
  if (!lead) throw new ApiError(404, 'Lead not found');
  res.status(200).json(new ApiResponse(200, { lead }, 'Lead updated'));
});

export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findOneAndDelete({ _id: req.params.id, brandId: req.params.brandId });
  if (!lead) throw new ApiError(404, 'Lead not found');
  res.status(200).json(new ApiResponse(200, null, 'Lead deleted'));
});

export const patchLeadStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const lead = await Lead.findOneAndUpdate(
    { _id: req.params.id, brandId: req.params.brandId },
    { status }, { new: true }
  );
  if (!lead) throw new ApiError(404, 'Lead not found');
  await LeadActivity.create({
    leadId: lead._id, type: 'status_changed',
    description: `Status changed to ${status}`,
    performedBy: req.user._id,
  });
  res.status(200).json(new ApiResponse(200, { lead }, 'Status updated'));
});

export const getActivities = asyncHandler(async (req, res) => {
  const activities = await LeadActivity.find({ leadId: req.params.id })
    .populate('performedBy', 'name avatarUrl')
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { activities }, 'Activities fetched'));
});

export const addNote = asyncHandler(async (req, res) => {
  const lead = await Lead.findOne({ _id: req.params.id, brandId: req.params.brandId });
  if (!lead) throw new ApiError(404, 'Lead not found');

  const note = await LeadNote.create({ leadId: lead._id, content: req.body.content, createdBy: req.user._id });
  await LeadActivity.create({
    leadId: lead._id, type: 'note_added',
    description: 'Note added',
    performedBy: req.user._id,
  });
  res.status(201).json(new ApiResponse(201, { note }, 'Note added'));
});
