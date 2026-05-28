import {z} from "zod"

export const addLinkSchema = z.object({
    title: z.string().min(1, "Title is required"),
    url: z.url().min(1, "Must be a valid URL"),
    icon: z.string().optional(),
    status: z.number().int().min(0).max(2).optional(),
    thumbnailUrl: z.string().optional(),
    thumbnailKey: z.string().optional(),
});