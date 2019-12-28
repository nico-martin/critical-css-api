import jwt from 'jsonwebtoken';

export const forbiddenObject = {
  status: 403,
  code: 'no_permission',
  text: "You don't have permission to access",
};

export const isMaster = key => key === process.env.MASTER_KEY;

export const getUserByToken = token => {
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return false;
  }
  return parseInt(decoded.userId);
};

export const generateToken = userId => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: 60 * 60 * 24,
  });
};

export const authenticate = token => {
  if (isMaster(token)) {
    return 'master';
  }
  return getUserByToken(token);
};
