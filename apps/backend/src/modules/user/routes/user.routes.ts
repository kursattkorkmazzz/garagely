import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import {
  UserRepository,
  UserPreferencesRepository,
} from '../repositories/user.repository';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { validatePayload } from '../../../common/middleware/validate.middleware';
import {
  updateUserPayloadValidator,
  updateUserPreferencesPayloadValidator,
} from '@garagely/shared/payloads/user';
import { asyncHandler } from '../../../common/utils/async-handler.util';

const router = Router();

const userRepository = new UserRepository();
const preferencesRepository = new UserPreferencesRepository();
const userService = new UserService(userRepository, preferencesRepository);
const userController = new UserController(userService);

router.use(authMiddleware);

router.get('/me', asyncHandler(userController.getMe));

router.patch(
  '/me',
  validatePayload(updateUserPayloadValidator),
  asyncHandler(userController.updateMe)
);

router.patch(
  '/me/preferences',
  validatePayload(updateUserPreferencesPayloadValidator),
  asyncHandler(userController.updateMyPreferences)
);

router.delete('/me', asyncHandler(userController.deleteMe));

export { router as userRouter };
