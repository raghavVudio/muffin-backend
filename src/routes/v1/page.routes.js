import express from 'express';
import { listPages, createPage, getPage, updatePage, deletePage, publishPage, unpublishPage, generatePageAsync } from '../../controllers/page.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { checkBrandAccess } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createPageSchema, updatePageSchema, generatePageAsyncSchema } from '../../validators/page.validator.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate, checkBrandAccess);

router.get('/',            listPages);
router.post('/',           validate(createPageSchema), createPage);
router.post('/generate',   validate(generatePageAsyncSchema), generatePageAsync);
router.get('/:id',        getPage);
router.put('/:id',        validate(updatePageSchema), updatePage);
router.delete('/:id',     deletePage);
router.post('/:id/publish',   publishPage);
router.post('/:id/unpublish', unpublishPage);

export default router;
