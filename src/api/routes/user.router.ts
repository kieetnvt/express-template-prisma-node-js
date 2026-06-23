import { NextFunction, Router, Request, Response } from 'express';
import UserHandler from '../handlers/user.handler.js';
import { successResponse } from './response.js';
import { auth } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/:id', auth, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const mID = id === 'me' ? req.userId! : parseInt(id, 10);

    const user = await UserHandler.getOne(mID);
    return successResponse(res, { user });
  } catch (err: unknown) {
    next(err);
  }
})

router.put('/profile', auth, async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, address } = req.body;
    const user = await UserHandler.update(req.userId!, { name, email, address });
    return successResponse(res, { user });
  } catch (err: unknown) {
    next(err);
  }
})

export default router;
