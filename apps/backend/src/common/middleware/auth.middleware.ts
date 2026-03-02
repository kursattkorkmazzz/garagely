import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "@garagely/shared/error.types";
import { verifyToken } from "../utils/jwt.util";

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing or invalid authorization header");
    }

    const token = authHeader.substring(7);

    const decoded = verifyToken(token);

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError("Invalid or expired token"));
    }
  }
}
