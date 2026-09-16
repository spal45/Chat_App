import express from "express";
import { getAllUsers, getAUser, loginUser, myProfile, updateName, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middleware/isAuth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../config/rateLimiter.js";
import { loginSchema, updateNameSchema, userIdParamSchema, verifySchema } from "../validators/user.js";

const router = express.Router();

router.post("/login", authLimiter, validate({ body: loginSchema }), loginUser);
router.post("/verify", authLimiter, validate({ body: verifySchema }), verifyUser);
router.get("/me", isAuth, myProfile)
router.get("/user/all", isAuth, getAllUsers)
router.get("/user/:id", isAuth, validate({ params: userIdParamSchema }), getAUser)
router.post("/update/user", isAuth, validate({ body: updateNameSchema }), updateName)


export default router;
