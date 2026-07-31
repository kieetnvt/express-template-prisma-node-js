import { Router } from 'express';

import CommentController from '@/api/controllers/comment.controller';
import { auth } from '@/api/middlewares/auth.middleware';
import { asyncHandler } from '@/api/middlewares/async-handler.middleware';
import { validateBody } from '@/api/middlewares/validation.middleware';
import { createCommentSchema } from '@/api/routes/validators/comment.validator';

const router = Router();

router.get('/', auth, asyncHandler(CommentController.getUserComments));

router.post(
  '/',
  auth,
  validateBody(createCommentSchema),
  asyncHandler(CommentController.createComment)
);

export default router;
