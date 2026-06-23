import { NextFunction, Request, Response, Router } from 'express';

import AuthHandler from '../handlers/auth.handler.js';
import { successResponse } from './response.js';
import { signUpSchema, loginSchema } from './validators/auth.validator.js';

const router = Router();

router.post('/sign-up', async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validBody = await signUpSchema.validateAsync(req.body);
    const { name, email, password } = validBody;
    const user = await AuthHandler.signUp({
      name,
      email,
      password
    });
    return successResponse(res, { user });
  } catch (err: unknown) {
    next(err);
  }
})

router.post('/login', async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validBody = await loginSchema.validateAsync(req.body);
    const token = await AuthHandler.login(validBody);

    return successResponse(res, { token });
  } catch (err: unknown) {
    next(err);
  }
})

export default router;
