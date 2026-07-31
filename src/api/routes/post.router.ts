import { Router } from 'express';

import PostController from '@/api/controllers/post.controller';
import { auth } from '@/api/middlewares/auth.middleware';
import { asyncHandler } from '@/api/middlewares/async-handler.middleware';
import { validateBody } from '@/api/middlewares/validation.middleware';
import { createPostSchema } from '@/api/routes/validators/post.validator';

const router = Router();

router.get('/', auth, asyncHandler(PostController.getUserPosts));

router.post(
  '/',
  auth,
  validateBody(createPostSchema),
  asyncHandler(PostController.createPost)
);

export default router;
