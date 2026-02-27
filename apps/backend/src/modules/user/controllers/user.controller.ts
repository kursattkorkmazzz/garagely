import type { Request, Response } from 'express';
import type { UserService } from '../services/user.service';
import { sendSuccess } from '../../../common/utils/response.util';

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
}
