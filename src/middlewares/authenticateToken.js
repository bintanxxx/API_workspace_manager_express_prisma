import jwt from 'jsonwebtoken';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

const authenticateToken = async  (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'Token tidak ada.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const {jti} = decoded;

        const tokenInBlackList = await prisma.invalid_tokens.findUnique({
            where : {jti:jti}
        })

        if (tokenInBlackList) {
            return res.status(401).json({error : "Token tidak valid (telah logout)"})
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token tidak valid atau kedaluwarsa.' });
    }
}

export default authenticateToken;