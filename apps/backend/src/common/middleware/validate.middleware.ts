import type { Request, Response, NextFunction } from 'express';
import type { AnySchema } from 'yup';
import { ValidationError } from '@garagely/shared/error.types';

export function validatePayload(schema: AnySchema) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });

      req.body = validated;
      next();
    } catch (err) {
      if (err instanceof Error && 'inner' in err) {
        const yupError = err as { inner: Array<{ path?: string; message: string }> };
        const details: Record<string, string[]> = {};

        for (const error of yupError.inner) {
          const path = error.path ?? 'unknown';
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(error.message);
        }

        next(new ValidationError('Validation failed', details));
        return;
      }

      next(err);
    }
  };
}
