// Middleware ini tugasnya menjalankan skema Zod
export const validate = (schema) => async (req, res, next) => {
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
    // Kalo gagal validasi, kirim error 400 (Bad Request)
    const errorMessages = error.errors.map(err => err.message);
    return res.status(400).json({ errors: errorMessages });
  }
};