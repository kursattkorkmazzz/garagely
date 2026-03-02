import type { RegisterPayload, LoginPayload } from "@garagely/shared/payloads/auth";
import type { UserModel } from "@garagely/shared/models/user";
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
}
