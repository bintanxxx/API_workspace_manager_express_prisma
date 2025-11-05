import {z} from 'zod';

export const registerSchema = z.object({
    body: z.object({
        email: z
            .string({required_error: "Email wajib diisi"})
            .email('Format email tidak valid'),
        
        password: z
            .string({required_error: "Password wajib diisi"})
            .min(6, "Password minimal 6 karakter"),
        
        name: z
            .string()
            .optional(),
    })
})


export const loginSchema = z.object ({
    body : z.object({
        email: z
            .string({required_error : "Email wajib diisi!"})
            .email("Format email tidak valid"),
        
        password : z
            .string({required_error: 'Password wajib di isi'})
    })
})