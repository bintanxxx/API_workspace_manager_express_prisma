import express from 'express';
import authRoutes from './auth.routes.js';
import workspaceRoutes from './workspace.routes.js';

const router = express.Router()

router.use('/auth', authRoutes)
router.use('/workspace', workspaceRoutes)

export default router;
