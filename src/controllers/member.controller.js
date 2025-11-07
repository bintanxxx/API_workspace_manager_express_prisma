import {PrismaClient, Prisma} from '@prisma/client'
import { email } from 'zod';

const prisma = new PrismaClient();

export const listMembers = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {userId} = req.user;

        const memberCheck = await prisma.workspace_members.findFirst({
            where : {
                workspace_id : id,
                user_id : userId
            }
        })

        if (!memberCheck) {
            return res.status(403).json({message : "Kamu bukan member dari workspace ini"})
        }

        const memberList = await prisma.workspace_members.findMany({
            where :{
                workspace_id : id
            },
            include :{
                users: {
                    select : {
                        id: true,
                        name : true,
                        email : true
                    }
                }
            }
        })

        const simplifiedMembers = memberList.map(member => {
            return {
                userId : member.users.id,
                name : member.users.name,
                email: member.users.email,
                role : member.role
            }
        })

        res.status(200).json({
            message : "Berhasil mengambil data member workspace",
            data : simplifiedMembers
        })
    } catch (error) {
        next(error)
    }
}


// export const inviteMember = async (req, res, next) => {
//     try {
//         const {id} = req.params;
//         const {userId} = req.user;

//         const {email, role} = req.body;

//         const memberIsAdmin = await prisma.workspace_members.findFirst({
//             where : {
//                 workspace_id: id,
//                 user_id : userId,
//                 role: 'admin'
//             }
//         })

//         if (!memberIsAdmin) {
//             return res.status(403).json({message : "Anda tidak memiliki akses untuk mengundang!"})
//         }

//         const userCheck = await prisma.users.findUnique({
//             where : {email: email}
//         })

//         if (!userCheck) {
//             return res.status(404).json({message : "User tidak ditemukan"})
//         }

//         const isMember = await prisma.workspace_members.findFirst({
//             where : {
//                 workspace_id: id,
//                 user_id : userCheck.id
//             }
//         })

//         if (isMember) {
//             return res.status(409).json({message : "User sudah menjadi member di workspace ini"})
//         }

//         await prisma.workspace_members.create({
//             data : {
//                 workspace_id: id,
//                 user_id : userCheck.id,
//                 role : role
//             }
//         })

//         res.status(201).json({message : "User berhasil ditambahkan ke workspace sebagai member"})

//     } catch (error) {
//         next(error)
//     }
// }

export const inviteMember = async (req, res, next) => {
    try {
        const {id} = req.params;
        const {userId} = req.user;

        const {email, role} = req.body;

        const [adminCheck, userToInvite] = await prisma.$transaction([
            prisma.workspace_members.findFirst({
                where : {
                    workspace_id : id,
                    user_id : userId,
                    role : role
                }
            }),

            prisma.users.findUnique({
                where : {email : email}
            })
        ])

        if (!adminCheck) {
            return res.status(403).json({message : "Anda tidak memiliki akses"})
        }

        if (!userToInvite) {
            return res.status(404).json({message : "User tidak ditemukan"})
        }

        await prisma.workspace_members.create({
            data : {
                workspace_id : id,
                user_id : userToInvite.id,
                role : role
            }
        })

        res.status(201).json({message : "User berhasil ditambahkan ke workspace sebagai member"})

    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                return res.status(409).json({message : "User sudah terdaftar sebagai member di workspace ini"})
            }
        }
        next(error);
    }
}


export const updateMemberRole = async (req, res, next) => {
    try {
        const {id, user_id} = req.params;
        const {userId} = req.user;
        const {role} = req.body;

        const [adminCheck, userToUpdate] = await prisma.$transaction([
            prisma.workspace_members.findFirst({
                where : {
                    workspace_id : id,
                    user_id : userId,
                    role : 'admin'
                }
            }),

            prisma.users.findUnique({
                where : {
                    id : user_id
                }
            })
        ])

        if (!adminCheck) {
            return res.status(403).json({message : "Anda tidak memiliki akses"})
        }

        if (!userToUpdate) {
            return res.status(404).json({message : "User tidak ditemukan"})
        }

        const newRole = await prisma.workspace_members.update({
            where : {
                user_id_workspace_id : {
                    user_id : user_id,
                    workspace_id : id
                }
            },
            data : {
                role : role
            }
        })

        res.status(200).json({
            message : "Role user berhasil di ubah",
            data : newRole
        })
    } catch (error) {
        next(error)
    }
}

export const deleteMember = async (req, res, next) => {
    try {
        const {id : workspace_id, user_id : targetUserId} = req.params;
        const {userId: requesterId} = req.user;

        const workspace = await prisma.workspaces.findUnique({
            where : {id : workspace_id}
        })

        if (!workspace) {
            return res.status(404).json({message : "Workspace tidak ditemukan"})
        }

        if (targetUserId === workspace.owner_id) {
            return res.status(400).json({ message: "Pemilik workspace tidak bisa dikeluarkan." });
        }

        // ngecek si yg pengen ngekick member atau bukan
        const requesterMembership = await prisma.workspace_members.findFirst({
            where : {
                workspace_id  : workspace_id,
                user_id : requesterId
            }
        })

        if (!requesterMembership) {
            return res.status(403).json({message : "Kamu bukan member dari workspace ini"})
        }

        // Skenario A : Jika user mau leave
        if (targetUserId === requesterId) {
            // cek dia admin atau bukan, dan apa dia admin terakhir atau bukan
            if (requesterMembership.role === "admin") {
                const adminCount = await prisma.workspace_members.count({
                    where : {
                        workspace_id : workspace_id,
                        role : "admin"
                    }
                })

                if (adminCount <= 1) {
                    return res.status(400).json({message : "Admin terakhir tidak bisa keluar. Tunjuk admin baru atau hapus workspace"})
                }
            }
        // kalo user mau kick orang lain 
        } else {
            if (requesterMembership.role !== "admin") {
                return res.status(403).json({message : "Anda tidak punya hak akses"})
            }
        }

        await prisma.workspace_members.delete({
            where : {
                user_id_workspace_id : {
                    user_id : targetUserId,
                    workspace_id : workspace_id
                }
            }
        })

        res.status(200).json({ message: "Member berhasil dihapus dari workspace." });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return res.status(404).json({ message: "Member yang ingin dihapus tidak ditemukan." });
        }
        next(error)
    }
}
