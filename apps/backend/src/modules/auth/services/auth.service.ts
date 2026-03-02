import type { RegisterPayload, LoginPayload, ChangePasswordPayload } from "@garagely/shared/payloads/auth";
import type { UserModel } from "@garagely/shared/models/user";
import { InvalidCredentialsError } from "@garagely/shared/error.types";
import { auth } from "../../../providers/firebase";
import { createToken } from "../../../common/utils/jwt.util";
import { UserService } from "../../user/services/user.service";

export interface AuthResult {
  user: UserModel;
  customToken: string;
}

export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(data: RegisterPayload): Promise<AuthResult> {
    const firebaseUser = await auth.createUser({
      email: data.email,
      password: data.password,
      displayName: data.fullName,
    });

    const user = await this.userService.createUser(firebaseUser.uid, {
      email: data.email,
      fullName: data.fullName,
    });

    const customToken = createToken({ uid: firebaseUser.uid, email: data.email });

    return { user, customToken };
  }

  async login(data: LoginPayload): Promise<AuthResult> {
    const firebaseUser = await auth.getUserByEmail(data.email);

    const user = await this.userService.getUserById(firebaseUser.uid);
    const customToken = createToken({ uid: firebaseUser.uid, email: user.email });

    return { user, customToken };
  }

  async changePassword(userId: string, data: ChangePasswordPayload): Promise<void> {
    const firebaseUser = await auth.getUser(userId);

    if (!firebaseUser.email) {
      throw new InvalidCredentialsError("User email not found");
    }

    await this.verifyPassword(firebaseUser.email, data.currentPassword);

    await auth.updateUser(userId, { password: data.newPassword });
  }

  private async verifyPassword(email: string, password: string): Promise<void> {
    const useEmulator = process.env.FIREBASE_USE_EMULATOR === "true";
    const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST ?? "127.0.0.1:9099";

    let url: string;

    if (useEmulator) {
      url = `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key`;
    } else {
      const apiKey = process.env.FIREBASE_API_KEY;

      if (!apiKey) {
        throw new Error("FIREBASE_API_KEY environment variable is not set");
      }

      url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: false,
      }),
    });

    if (!response.ok) {
      throw new InvalidCredentialsError("Current password is incorrect");
    }
  }
}
