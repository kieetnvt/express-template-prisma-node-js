import { NextFunction, Router, Request, Response } from 'express';
import PostHandler from '../handlers/post.handler.js';
import { successResponse } from './response.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', auth, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const posts = await PostHandler.getUserPosts(req.userId!);
    return successResponse(res, { posts });
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
    const { title, content } = req.body;
    const post = await PostHandler.createPost(req.userId!, title, content);
    return successResponse(res, { post });
  } catch (error: unknown) {
    next(error);
  }
});

export default router;
