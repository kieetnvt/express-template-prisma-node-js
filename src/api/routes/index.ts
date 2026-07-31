import { Router } from 'express';
import UserRouter from '@/api/routes/user.router';
import AuthRouter from '@/api/routes/auth.router';
import PostRouter from '@/api/routes/post.router';
import CommentRouter from '@/api/routes/comment.router';

const router = Router();

router.use('/users', UserRouter);
router.use('/auth', AuthRouter);
router.use('/posts', PostRouter);
router.use('/comments', CommentRouter);

export default router;
