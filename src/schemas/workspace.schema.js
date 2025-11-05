import {z} from 'zod';

export const createWorkspaceSchema = z.object({
    body : z.object({
        name : z
            .string({required_error: "Nama workspace wajib di isi"})
            .min(1, "Nama workspace tidak boleh kosong")
    })
})

export const getWorkspaceSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID workspace harus format UUID"),
    }),
});