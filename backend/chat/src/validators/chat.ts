import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createChatSchema = z.object({
    otherUserId: objectId,
});

export const sendMessageSchema = z.object({
    chatId: objectId,
    text: z.string().trim().max(2000, "Message is too long").optional(),
});

export const chatIdParamSchema = z.object({
    chatId: objectId,
});
