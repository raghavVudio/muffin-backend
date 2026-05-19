import express from 'express';
import { listVideos, createVideo, getVideo, updateVideo, deleteVideo, publishVideo, unpublishVideo } from '../../controllers/video.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { checkBrandAccess } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createVideoSchema, updateVideoSchema } from '../../validators/video.validator.js';

const router = express.Router({ mergeParams: true });
router.use(authenticate, checkBrandAccess);

router.get('/',           listVideos);
router.post('/',          validate(createVideoSchema), createVideo);
router.get('/:id',        getVideo);
router.put('/:id',        validate(updateVideoSchema), updateVideo);
router.delete('/:id',     deleteVideo);
router.post('/:id/publish',   publishVideo);
router.post('/:id/unpublish', unpublishVideo);

export default router;
