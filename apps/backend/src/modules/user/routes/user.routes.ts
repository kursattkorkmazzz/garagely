import { Router } from 'express';
import multer from 'multer';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from "../repositories/user.repository";
import { UserPreferencesRepository } from "../repositories/user-preferences.repository";
import { StorageService } from '../../storage/services/storage.service';
import { DocumentRepository } from '../../storage/repositories/document.repository';
import { DocumentRelationRepository } from '../../storage/repositories/document-relation.repository';
import { authMiddleware } from '../../../common/middleware/auth.middleware';
import { validatePayload } from '../../../common/middleware/validate.middleware';
import {
  updateUserPayloadValidator,
  updateUserPreferencesPayloadValidator,
} from '@garagely/shared/payloads/user';
import { asyncHandler } from '../../../common/utils/async-handler.util';
import { getStorageLimits } from '../../storage/config/storage.config';
import { EntityType } from '@garagely/shared/models/entity-type';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: getStorageLimits(EntityType.USER_PROFILE).maxFileSize,
  },
});

const userRepository = new UserRepository();
const preferencesRepository = new UserPreferencesRepository();
const documentRepository = new DocumentRepository();
const documentRelationRepository = new DocumentRelationRepository();
const storageService = new StorageService(documentRepository, documentRelationRepository);
const userService = new UserService(userRepository, preferencesRepository, storageService);
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

router.post('/me/avatar', upload.single('file'), asyncHandler(userController.uploadAvatar));
router.get('/me/avatar', asyncHandler(userController.getAvatar));
router.delete('/me/avatar', asyncHandler(userController.removeAvatar));

export { router as userRouter };
