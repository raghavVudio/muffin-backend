import express from 'express';
import {
  listBrands, createBrand, getBrand, updateBrand, deleteBrand,
  getBrandKit, updateBrandKit, listMembers, addMember, onboardBrand,
} from '../../controllers/brand.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize, checkBrandAccess } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createBrandSchema, updateBrandSchema, addMemberSchema, onboardBrandSchema } from '../../validators/brand.validator.js';
import { ROLES } from '../../constants/index.js';

const router = express.Router();
router.use(authenticate);

router.get('/',   listBrands);
router.post('/',  authorize(ROLES.ORG_ADMIN), validate(createBrandSchema), createBrand);

router.get('/:brandId',    checkBrandAccess, getBrand);
router.put('/:brandId',    checkBrandAccess, authorize(ROLES.ORG_ADMIN), validate(updateBrandSchema), updateBrand);
router.delete('/:brandId', checkBrandAccess, authorize(ROLES.ORG_ADMIN), deleteBrand);

router.get('/:brandId/kit', checkBrandAccess, getBrandKit);
router.put('/:brandId/kit', checkBrandAccess, authorize(ROLES.ORG_ADMIN, ROLES.BRAND_ADMIN), updateBrandKit);

router.post('/:brandId/onboard', checkBrandAccess, validate(onboardBrandSchema), onboardBrand);

router.get('/:brandId/members',  checkBrandAccess, listMembers);
router.post('/:brandId/members', checkBrandAccess, authorize(ROLES.ORG_ADMIN), validate(addMemberSchema), addMember);

export default router;
