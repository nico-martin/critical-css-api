export const forbiddenObject = {
  status: 403,
  code: 'no_permission',
  text: "You don't have permission to access",
};
export const isMaster = key => key === process.env.MASTER_KEY;
