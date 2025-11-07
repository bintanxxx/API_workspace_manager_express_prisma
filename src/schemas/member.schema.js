import {z} from 'zod'

export const inviteMemberSchema = z.object({
    params: z.object({
        id: z.string().uuid("ID workspace harus format UUID"),
    }),
    body: z.object({
        email: z.string().email("Format email tidak valid"),
        role: z.enum(['admin', 'member'], { // Paksa role-nya
            errorMap: () => ({ message: "Role harus 'admin' atau 'member'" })
        })
    })
});

export const updateMemberSchema = z.object({
    params : z.object({
        id : z.string().uuid('ID workspace harus UUID'),
        user_id : z.string().uuid('ID user harus UUID'),
    }),
    body : z.object({
        role : z.enum(['admin', 'member'], {
            errorMap: () => ({message : "Role harus 'admin' atau 'member'"})
        })
    })
})

export const deleteMemberSchema = z.object({
    params : z.object({
        id : z.string().uuid('ID workspace harus UUID'),
        user_id : z.string().uuid('ID user harus UUID'),
    })
})
