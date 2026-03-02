import type { Request, Response } from "express";
import type { AuthService } from "../services/auth.service";
import { sendSuccess } from "../../../common/utils/response.util";

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    sendSuccess(res, result, 201);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    sendSuccess(res, result);
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.uid;
    await this.authService.changePassword(userId, req.body);
    sendSuccess(res, { message: "Password changed successfully" });
  };
}
