import { Router } from 'express';

import AuthController from '@/api/controllers/auth.controller';
import { asyncHandler } from '@/api/middlewares/async-handler.middleware';
import { validateBody } from '@/api/middlewares/validation.middleware';
import { loginSchema, signUpSchema } from '@/api/routes/validators/auth.validator';

const router = Router();

router.post(
  '/sign-up',
  validateBody(signUpSchema),
  asyncHandler(AuthController.signUp)
);

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(AuthController.login)
);

export default router;
