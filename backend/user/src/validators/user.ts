import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
});

export const verifySchema = z.object({
    email: z.string().trim().toLowerCase().email("Invalid email address"),
    otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});

export const updateNameSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(50, "Name must be under 50 characters"),
});

export const userIdParamSchema = z.object({
    id: objectId,
});
