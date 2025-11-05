import express from 'express';

import {getWorkspaces, createWorkspace, getWorkspaceById} from '../controllers/workspace.controller.js';
import authenticateToken from '../middlewares/authenticateToken.js'
import {validate} from '../middlewares/validate.js'
import {createWorkspaceSchema, getWorkspaceSchema} from '../schemas/workspace.schema.js'

const router = express.Router()

router.route('/')
    .get(authenticateToken, getWorkspaces)
    .post(authenticateToken, validate(createWorkspaceSchema), createWorkspace)

router.get('/:id', authenticateToken, validate(getWorkspaceSchema),getWorkspaceById)

export default router;