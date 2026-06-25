const errorHandler = (err, req, res, next) => {
  // If response status is still 200, default to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log the error stack locally for debugging
  console.error(`[API Error] ${req.method} ${req.url} - Status: ${statusCode}`);
  console.error(err.stack);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only send stack trace in non-production environments
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
};

module.exports = { errorHandler };
