import express from 'express'
import { createNewChat, getAllChats, getMessagesByChat, sendMessage } from '../controllers/chat.js';
import { isAuth } from '../middlewares/isAuth.js';
import { upload } from '../middlewares/multer.js';
import { validate } from '../middlewares/validate.js';
import { messageLimiter } from '../config/rateLimiter.js';
import { chatIdParamSchema, createChatSchema, sendMessageSchema } from '../validators/chat.js';

const router = express.Router();

router.post("/chat/new", isAuth, validate({ body: createChatSchema }), createNewChat);
router.get("/chat/all", isAuth, getAllChats);
router.post("/message", isAuth, messageLimiter, upload.single('image'), validate({ body: sendMessageSchema }), sendMessage)
router.get("/message/:chatId", isAuth, validate({ params: chatIdParamSchema }), getMessagesByChat)

export default router;
