import jwt, { type SignOptions } from "jsonwebtoken";
import { UnauthorizedError } from "@garagely/shared/error.types";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  uid: string;
  email?: string;
}

export function createToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  return jwt.sign(payload, JWT_SECRET, options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
