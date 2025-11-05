import {PrismaClient} from '@prisma/client'


const prisma = new PrismaClient()

export const getWorkspaces = async (req, res, next) => {
    try {
        const {userId} = req.user;

        const workspaces = await prisma.workspaces.findMany({
            where : {
                workspace_members: {
                    some : {
                        user_id : userId
                    }
                }
            },
            select: {
                id: true,
                name: true,
                owner_id: true
            }
        })

        res.status(200).json({
            message : "Berhasil mendapatkan workspaces",
            data : workspaces
        })


    } catch (error) {
        next(error)
    }
}

export const createWorkspace = async (req, res, next) => {
    try {
        const {userId} = req.user;
        const {name} = req.body;

        const newWorkspace = await prisma.workspaces.create({
            data : {
                name : name,
                owner_id: userId,

                workspace_members : {
                    create : {
                        user_id : userId,
                        role: 'admin'
                    }
                }
            }
        })

        res.status(201).json({
            message : "Workspace berhasil di buat",
            data : {
                workspace_id : newWorkspace.id,
                workspace_name : newWorkspace.name
            }
        })
    } catch (error){
        next(error)
    }
}

export const getWorkspaceById = async (req, res, next) => {
    try {
        const {id} = req.params // id workspace
        const {userId} = req.user;

        const workspace = await prisma.workspaces.findFirst({
            where : {
                id: id,
                AND : {
                    workspace_members : {
                        some : {
                            user_id : userId
                        }
                    }
                }
            }
        })

        if (!workspace) {
            return res.status(404).json({message : "Workspace tidak ditemukan!"})
        }

        res.status(200).json({
            message : "Workspace berhasil ditemukan",
            data : workspace
        })
    } catch (error) {
        next(error)
    }
}