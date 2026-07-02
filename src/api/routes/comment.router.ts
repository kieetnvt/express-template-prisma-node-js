import { NextFunction, Router, Request, Response } from 'express';
import CommentHandler from '../handlers/comment.handler.js';
import { successResponse } from './response.js';
import { auth } from '../middlewares/auth.middleware.js';
import { createCommentSchema } from './validators/comment.validator.js';

const router = Router();

router.get('/', auth, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const comments = await CommentHandler.getUserComments(req.userId!);
    return successResponse(res, { comments });
  } catch (error: unknown) {
    next(error);
  }
});

router.post('/', auth, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validBody = await createCommentSchema.validateAsync(req.body);
    const { content, postId } = validBody;
    const comment = await CommentHandler.createComment(req.userId!, postId, content);
    return successResponse(res, { comment });
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
