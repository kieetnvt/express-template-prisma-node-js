import { Router } from 'express';
import UserRouter from './user.router.js';
import AuthRouter from './auth.router.js';

const router = Router();

router.use('/users', UserRouter);
router.use('/auth', AuthRouter);

export default router;
