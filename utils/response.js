const succeeded = (
  res,
  statusCode = 200,
  message = "Successfully completed.",
  data = {}
) =>
  res.status(statusCode).json({
    status: true,
    message,
    data,
    error: null,
  });

const failed = (
  res,
  statusCode = 500,
  message = "Please, Try again!",
  data = {}
) =>
  res.status(statusCode).json({
    status: false,
    message,
    data: null,
    error: data,
  });

module.exports = { succeeded, failed };
