export const authorization = (...role) => {
  return async (req, res, next) => {
    if (!role.includes(req.user.role))
      return next(
        new Error("unauthorized to make this action", { cause: 403 })
      );

    return next();
  };
};
