const asyncHandler = (reqHandler) => (req, res, next) => {
  Promise.resolve(reqHandler(req, res, next)).catch((err) => {
    next(err);
  });
};

export default asyncHandler
