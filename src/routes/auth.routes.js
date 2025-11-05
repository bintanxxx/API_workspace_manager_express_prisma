import express from 'express';
import { registerUser, loginUser, logoutUser } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js'; // Middleware validasi (kita buat di bawah)
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import authenticateToken from '../middlewares/authenticateToken.js'

const router = express.Router()

router.post('/register',
    validate(registerSchema),
    registerUser
)

router.post('/login',
    validate(loginSchema),
    loginUser
)

router.post('/logout',
    authenticateToken,
    logoutUser
)


export default router;