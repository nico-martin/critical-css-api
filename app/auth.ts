import jwt from 'jsonwebtoken';
import { ErrorReturn, RequestHeaders } from './types/express';

export const forbiddenObject: ErrorReturn = {
  status: 403,
  code: 'no_permission',
  text: "You don't have permission to access",
};

const isMaster = (key: string): boolean => key === process.env.MASTER_KEY;

const getUserByToken = (token: string): number | false => {
  let decoded;
  try {
    decoded = Object(jwt.verify(token, String(process.env.JWT_SECRET)));
  } catch (err) {
    return false;
  }
  return Number(decoded.userId);
};

export const generateToken = (userId: number, expires: number): string =>
  jwt.sign({ userId }, String(process.env.JWT_SECRET), {
    expiresIn: expires,
  });

export const authenticate = (
  headers: RequestHeaders
): number | 'master' | false => {
  const token = (headers.authorization || '').replace('Bearer ', '');
  if (isMaster(token)) {
    return 'master';
  }
  return getUserByToken(token);
};

export const authenticateClient = (headers: RequestHeaders): boolean =>
  authenticate(headers) === 'master' ||
  typeof process.env.ALLOWED_HOSTS === 'undefined' ||
  process.env.ALLOWED_HOSTS.split(', ').indexOf(String(headers.origin)) !== -1;

export const authenticateUser = (
  headers: RequestHeaders,
  userID: string
): boolean | number => {
  const auth = authenticate(headers);
  if (userID === 'me' && auth === 'master') {
    return false;
  }
  const numericUserID = Number(userID === 'me' ? auth : userID);
  return auth === 'master' || auth === numericUserID ? numericUserID : false;
};

export const authenticateMaster = (headers: RequestHeaders): boolean =>
  authenticate(headers) === 'master';
