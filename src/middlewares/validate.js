// Middleware ini tugasnya menjalankan skema Zod
import { ZodError } from 'zod'

export const validate = (schema) => async (req, res, next) => {
  if (!schema) {
    return next(new Error("Skema validasi tidak terdefinisi"))
  }
  try {
    // Validasi 'req.body', 'req.params', dan 'req.query'
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    // Kalo lolos, lanjut ke controller
    return next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.errors.map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }
    next(error)
      
  }
};