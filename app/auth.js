import jwt from 'jsonwebtoken';

export const forbiddenObject = {
  status: 403,
  code: 'no_permission',
  text: "You don't have permission to access",
};

const isMaster = key => key === process.env.MASTER_KEY;

const getUserByToken = token => {
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

export const authenticate = headers => {
  const token = (headers.authorization || '').replace('Bearer ', '');
  if (isMaster(token)) {
    return 'master';
  }
  return getUserByToken(token);
};

export const authenticateClient = headers => {
  return (
    authenticate(headers) === 'master' ||
    typeof process.env.ALLOWED_HOSTS === 'undefined' ||
    process.env.ALLOWED_HOSTS.split(', ').indexOf(headers.origin) !== -1
  );
};

export const authenticateUser = (headers, userID) => {
  const auth = authenticate(headers);
  if (userID === 'me' && auth === 'master') {
    return false;
  }
  userID = parseInt(userID === 'me' ? auth : userID);
  return auth === 'master' || auth === userID ? userID : false;
};

export const authenticateMaster = headers => {
  return authenticate(headers) === 'master';
};
