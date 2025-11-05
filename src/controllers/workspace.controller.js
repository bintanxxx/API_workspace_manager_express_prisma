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

export const updateWorkspace = async (req, res, next) => {
    try {
        const {userId} = req.user;
        const {id} = req.params;
        const {name} = req.body; // nama baru yang di input

        const updateResult = await prisma.workspaces.updateMany({
            where : {
                id: id,
                workspace_members : {
                    some : {
                        user_id: userId,
                        role : "admin"
                    }
                }
            },
            data : {name : name}
        })

        if (updateResult.count === 0) {
            const workspaceExist = await prisma.workspaces.findUnique({
                where : {id : id}
            })

            if (!workspaceExist) {
                return res.status(404).json({message : "Workspace tidak ditemukan"})
            } else {
                return res.status(403).json({message : "Anda tidak memiliki hak akses (admin)"})
            }
        }

        

        res.status(200).json({
            message : "Berhasil Mengubah nama workspace",
            data : {
                id : id,
                name : name
            }
        })

    } catch (error) {
        next(error);
    }
}

export const deleteWorkspace = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {userId} = req.user;

        const deleteResult = await prisma.workspaces.deleteMany({
            where : {
                id : id,
                AND : {
                    workspace_members : {
                        some : {
                            user_id : userId,
                            role : "admin"
                        }
                    }
                }
            }
        })

        if (deleteResult.count === 0) {
            const workspaceExist = await prisma.workspaces.findUnique({
                where : {id: id}
            })

            if (!workspaceExist) {
                return res.status(404).json({message : "Workspace tidak ditemukan"})
            } else {
                return res.status(403).json({message : "Anda tidak memiliki hak akses (admin)"})
            }
        }

        res.status(200).json({
            message : "workspace berhasil di hapus"
        })

    } catch (error) {
        next(error)
    }
}