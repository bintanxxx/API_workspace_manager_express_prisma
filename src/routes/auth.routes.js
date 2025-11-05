import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js'; // Middleware validasi (kita buat di bawah)
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';

const router = express.Router()

router.post('/register',
    validate(registerSchema),
    registerUser
)

router.post('/login',
    validate(loginSchema),
    loginUser
)

export default router;