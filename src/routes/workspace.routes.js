import express from 'express';

import {
    getWorkspaces, 
    createWorkspace, 
    getWorkspaceById,
    updateWorkspace,
    deleteWorkspace
} from '../controllers/workspace.controller.js';

import authenticateToken from '../middlewares/authenticateToken.js'
import {validate} from '../middlewares/validate.js'
import {createWorkspaceSchema, getWorkspaceSchema, updateWorkspaceSchema} from '../schemas/workspace.schema.js'

const router = express.Router()

router.route('/')
    .get(authenticateToken, getWorkspaces)
    .post(authenticateToken, validate(createWorkspaceSchema), createWorkspace)

// router.get('/:id', authenticateToken, validate(getWorkspaceSchema),getWorkspaceById)
router.route('/:id')
    .get(authenticateToken, validate(getWorkspaceSchema),getWorkspaceById)
    .put(authenticateToken, validate(updateWorkspaceSchema), updateWorkspace)
    .delete(authenticateToken, validate(getWorkspaceSchema), deleteWorkspace)

export default router;