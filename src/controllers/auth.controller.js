import {PrismaClient} from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { hash } from 'zod';
import {randomUUID} from 'crypto'

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

        const tokenId = randomUUID();
        const token = jwt.sign(
            {userId : newUser.id, email: newUser.email},
            process.env.JWT_SECRET,
            {
                expiresIn: '7d',
                jwtid: tokenId
            }
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

export const loginUser = async (req, res, next) => {
    try {
        const {email, password} = req.body;

        // cari user berdasarkan email
        const user = await prisma.users.findUnique({
            where: {email : email.toLowerCase()}
        })
        // kalo user tidak ditemukan
        if (!user) {
            return res.status(404).json({error : "Email atau Password salah!"})
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({error: "Email atau Password salah!"}) //401 = Unauthorize
        }

        const tokenId = randomUUID();
        const token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_SECRET,
            {
                expiresIn: '7d',
                jwtid: tokenId
            }
        )

        res.status(200).json({
            message : "Login Berhasil",
            token: token,
            user : {
                id : user.id,
                email: user.email,
                name: user.name
            },
        })

    }
    catch (error) {
        next(error)
    }
}