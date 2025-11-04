import express from 'express';
import { registerUser } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js'; // Middleware validasi (kita buat di bawah)
import { registerSchema } from '../schemas/auth.schema.js';

const router = express.Router()

router.post('/register',
    validate(registerSchema),
    registerUser
)

export default router;