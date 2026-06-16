// Validate req.body against a shared zod schema from @pm/schemas.
// On success, req.body is replaced with the parsed value (coercions applied,
// unknown keys dropped). On failure, respond 400 with the field-keyed errors.

function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      // Diagnostic: log rejection so the cause is visible in the server
      // terminal without having to expand the wrapped response in the
      // browser. Safe to keep — does not leak request body contents.
      console.warn(
        `[validateBody] ${req.method} ${req.originalUrl} rejected:`,
        JSON.stringify(errors)
      );
      return res.status(400).json({ errors });
    }
    req.body = result.data;
    next();
  };
}

module.exports = { validateBody };
