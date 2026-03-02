import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { UserService } from "../../user/services/user.service";
import {
  UserRepository,
  UserPreferencesRepository,
} from "../../user/repositories";
import { validatePayload } from "../../../common/middleware/validate.middleware";
import {
  registerPayloadValidator,
  loginPayloadValidator,
  changePasswordPayloadValidator,
} from "@garagely/shared/payloads/auth";
import { authMiddleware } from "../../../common/middleware/auth.middleware";
import { asyncHandler } from "../../../common/utils/async-handler.util";

const router = Router();

const userRepository = new UserRepository();
const preferencesRepository = new UserPreferencesRepository();
const userService = new UserService(userRepository, preferencesRepository);
const authService = new AuthService(userService);
const authController = new AuthController(authService);

router.post(
  "/register",
  validatePayload(registerPayloadValidator),
  asyncHandler(authController.register),
);

router.post(
  "/login",
  validatePayload(loginPayloadValidator),
  asyncHandler(authController.login),
);

router.post(
  "/change-password",
  authMiddleware,
  validatePayload(changePasswordPayloadValidator),
  asyncHandler(authController.changePassword),
);

export { router as authRouter };
