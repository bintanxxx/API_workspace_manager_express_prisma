
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Prisma } from '@prisma/client';

import mainApiRouter from './routes/index.js';
import { de } from 'zod/locales';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/api', mainApiRouter);

// Setup error handling
app.use((req, res, next) => {
    const error = new Error(`Rute tidak ditemukan - ${req.originalUrl}`)
    error.status = 404;

    next(error)
});


// Global error handler
// semua next(error) akan di tampung di sini
app.use((err, req, res, next) => {
    console.log(err.stack);

    let statusCode = err.status || 500;
    let message = err.message || "Internal server error";

    // 1. Handle error dari prisma
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // P2002 = data duplikat
        if (err.code === 'P2002') {
            statusCode = 409;
            const fields = err.meta.target.join(', ');
            message = `Data duplikat: ${fields} ini sudah terdaftar`
        } 
        // P2025 = Record to Update or Delete not Found
        else if (err.code === 'P2025') {
            statusCode = 404;
            message = `Data yang ingin anda ubah/hapus tidak ditemukan`
        }
    }

    if (err.name === 'ZodError') {
        statusCode = 400;
        message = err.errors.map(e => e.message).join(', ')
    }

    // === KIRIM BALASAN ERROR KE CLIENT ===
    res.status(statusCode).json({
        error: {
            message: message,
            // Tampilkan 'stack trace' hanya jika kita di mode development
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        }
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
})

export default app;