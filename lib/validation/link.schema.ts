import {z} from "zod"

export const addLinkSchema = z.object({
    title: z.string().min(1, "Title is required"),
    url: z.string().url("Must be a valid URL"),
    icon: z.string().optional(),
});