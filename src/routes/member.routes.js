import express from 'express';

import authenticateToken from '../middlewares/authenticateToken.js'
import {validate} from '../middlewares/validate.js'
import {createWorkspaceSchema, getWorkspaceSchema, updateWorkspaceSchema} from '../schemas/workspace.schema.js'
import {inviteMemberSchema, updateMemberSchema, deleteMemberSchema} from '../schemas/member.schema.js'

import {
    listMembers,
    inviteMember,
    updateMemberRole,
    deleteMember
} from '../controllers/member.controller.js'

const router = express.Router({mergeParams : true})

// router.get('/', authenticateToken, validate(getWorkspaceSchema), listMembers)
router.route('/')
    .get(authenticateToken, validate(getWorkspaceSchema), listMembers)
    .post(authenticateToken, validate(inviteMemberSchema), inviteMember)


router.route('/:user_id')
    .put(authenticateToken, validate(updateMemberSchema), updateMemberRole)
    .delete(authenticateToken, validate(deleteMemberSchema), deleteMember)

export default router;