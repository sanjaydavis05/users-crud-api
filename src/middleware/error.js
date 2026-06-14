const notFound = (req, res, _next) => {
  res.status(404).json({ error: `Not found: ${req.originalUrl}` });
};

const errorHandler = (err, _req, res, _next) => {
  console.error(err.stack);

  if (err.message?.includes('UNIQUE constraint failed')) {
    const field = err.message.match(/UNIQUE constraint failed: (\w+)\.(\w+)/)?.[2] || 'field';
    return res.status(409).json({ error: `Duplicate value for: ${field}` });
  }

  if (err.message?.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({ error: 'Invalid reference: related record not found' });
  }

  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: 'Validation failed', details: err.flatten().fieldErrors });
  }

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error',
  });
};

const { z } = require('zod');

module.exports = { errorHandler, notFound };
