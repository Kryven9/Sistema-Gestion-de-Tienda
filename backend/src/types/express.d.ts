import { JwtPayload } from '../infrastructure/http/middlewares/authMiddleware';

declare module 'express-serve-static-core' {
  interface Request {
    usuario?: JwtPayload;
  }
}
