import jwt, { SignOptions } from 'jsonwebtoken';
import { Types } from 'mongoose';
import { env } from '../config/env';

export interface JwtPayload {
  id: string;
  role: string;
}

export const signToken = (id: Types.ObjectId, role: string): string => {
  const payload: JwtPayload = { id: id.toString(), role };
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};
