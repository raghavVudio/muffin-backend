import express from 'express';
import { getPublicBrandKit, listPublicBlogs, getPublicBlog } from '../../controllers/public.controller.js';

const router = express.Router();

router.get('/:brandName',                       getPublicBrandKit);
router.get('/:brandName/blogs',                 listPublicBlogs);
router.get('/:brandName/blogs/:blogSlug',       getPublicBlog);

export default router;
