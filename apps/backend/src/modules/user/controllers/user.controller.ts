import type { Request, Response } from 'express';
import type { UserService } from '../services/user.service';
import type { UploadedFile } from '../../storage/services/storage.service';
import { sendSuccess } from '../../../common/utils/response.util';
import { ValidationError } from '@garagely/shared/error.types';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getMe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const user = await this.userService.getUserWithPreferences(userId);
    sendSuccess(res, user);
  };

  updateMe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const user = await this.userService.updateUser(userId, req.body);
    sendSuccess(res, user);
  };

  updateMyPreferences = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const user = await this.userService.updateUserPreferences(userId, req.body);
    sendSuccess(res, user);
  };

  deleteMe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    await this.userService.deleteUser(userId);
    sendSuccess(res, { message: 'User deleted successfully' });
  };

  uploadAvatar = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const file = req.file as UploadedFile | undefined;

    if (!file) {
      throw new ValidationError('No file uploaded', { file: ['File is required'] });
    }

    const document = await this.userService.uploadAvatar(userId, file);
    sendSuccess(res, document, 201);
  };

  getAvatar = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    const avatar = await this.userService.getAvatar(userId);
    sendSuccess(res, avatar);
  };

  removeAvatar = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    await this.userService.removeAvatar(userId);
    sendSuccess(res, { message: 'Avatar removed successfully' });
  };
}
