import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { hash } from 'zod';

const prisma = new PrismaClient();

export const registerUser = async (req, res, next) => {
    try {
        const {email, password, name} = req.body;

        const existingUser = await prisma.users.findUnique({
            where : {
                email: email.toLowerCase() 
            }
        })

        // cek apakah email sudah terdaftar
        if (existingUser) {return res.status(409).json({error: "Email sudah terdaftar"})}

        // hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // pembuatan user
        const newUser = await prisma.users.create({
            data: {
                email: email.toLowerCase(),
                password_hash: hashedPassword,
                name: name
            }
        })

        // setelah register otomatis buat private workspace
        await prisma.workspaces.create({
            data : {
                name : `${name || email}'s Private Workspace`,
                owner_id: newUser.id,
                // jadikan dia sebagai member di workspace rpivatenya
                workspace_members : {
                    create : {
                        user_id: newUser.id,
                        role: 'admin'
                    }
                }
            }
        })

        const token = jwt.sign(
            {userId : newUser.id, email: newUser.email},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )

        res.status(201).json({
            message : "User berhasil terdaftar",
            token: token,
            user: {
                id: newUser.id,
                name: newUser.name,
                email:newUser.email
            }
        })
    } catch (error) {
        next(error)
    }
}