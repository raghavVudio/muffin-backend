import express from 'express';
import { listLeads, createLead, getLead, updateLead, deleteLead, patchLeadStatus, getActivities, addNote } from '../../controllers/lead.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { checkBrandAccess } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createLeadSchema, updateLeadSchema, patchStatusSchema, addNoteSchema } from '../../validators/lead.validator.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate, checkBrandAccess);

router.get('/',               listLeads);
router.post('/',              validate(createLeadSchema), createLead);
router.get('/:id',            getLead);
router.put('/:id',            validate(updateLeadSchema), updateLead);
router.delete('/:id',         deleteLead);
router.patch('/:id/status',   validate(patchStatusSchema), patchLeadStatus);
router.get('/:id/activities', getActivities);
router.post('/:id/notes',     validate(addNoteSchema), addNote);

export default router;
