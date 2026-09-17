import { generateToken } from "../config/generateToken.js";
import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import type { AuthenticatedRequest } from "../middleware/isAuth.js";
import { User } from "../model/User.js";

const MAX_OTP_ATTEMPTS = 5;

// Designated demo accounts get a fixed, publicly-documented OTP instead of
// a random one, and skip real email delivery entirely - lets anyone (e.g.
// a recruiter) try the app, including messaging between two accounts,
// without needing real inboxes or working email infrastructure. Only
// these exact addresses are special-cased; every other email goes
// through the normal random-OTP + real-email flow.
const DEMO_ACCOUNTS: { email: string; otp: string }[] = [
    [process.env.DEMO_EMAIL, process.env.DEMO_OTP],
    [process.env.DEMO_EMAIL_2, process.env.DEMO_OTP_2],
]
    .filter((pair): pair is [string, string] => !!pair[0] && !!pair[1])
    .map(([email, otp]) => ({ email: email.toLowerCase(), otp }));

export const loginUser = TryCatch(async(req,res)=>{
    const {email} = req.body

    const rateLimitKey = `otp:ratelimit:${email}`
    const rateLimit = await redisClient.get(rateLimitKey);

    if(rateLimit) {
        res.status(429).json({
            message: "Too many requests. Please wait before requesting new otp"
        })
        return;
    }

    const demoAccount = DEMO_ACCOUNTS.find((a) => a.email === email?.toLowerCase());
    const isDemoAccount = !!demoAccount;

    const otp = demoAccount
        ? demoAccount.otp
        : Math.floor(100000 + Math.random() * 900000).toString()
    const otpKey = `otp:${email}`
    const attemptsKey = `otp:attempts:${email}`

    await redisClient.set(otpKey,otp,{
        EX:300,
    });
    await redisClient.del(attemptsKey);

    await redisClient.set(rateLimitKey, "true", {
        EX: 60,
    });

    if(!isDemoAccount){
        const message = {
            to: email,
            subject: "Your otp code",
            body: `Your OTP is ${otp}. It is valid for 5 minutes`
        };

        await publishToQueue("send-otp", message)
    }

    res.status(200).json({
        message: isDemoAccount
            ? "Demo account - use the published demo OTP"
            : "OTP sent to your mail"
    })
});


export const verifyUser = TryCatch(async(req,res)=>{
    const {email, otp:enteredOtp} = req.body;

    const otpKey = `otp:${email}`
    const attemptsKey = `otp:attempts:${email}`

    const storedOtp = await redisClient.get(otpKey);

    if(!storedOtp){
        res.status(400).json({
            message: "Invalid or expired OTP",
        });
        return;
    }

    const attempts = await redisClient.incr(attemptsKey);
    if(attempts === 1){
        await redisClient.expire(attemptsKey, 300);
    }

    if(attempts > MAX_OTP_ATTEMPTS){
        await redisClient.del(otpKey);
        await redisClient.del(attemptsKey);
        res.status(429).json({
            message: "Too many incorrect attempts. Please request a new OTP",
        });
        return;
    }

    if(storedOtp !== enteredOtp){
        res.status(400).json({
            message: "Invalid or expired OTP",
        });
        return;
    }

    await redisClient.del(otpKey)
    await redisClient.del(attemptsKey)

    let user = await User.findOne({email})

    if(!user){
        const name = email.slice(0,8)
        user = await User.create({name,email});
    }

    const token = generateToken(user)

    res.json({
        message: "User Verified",
        user,
        token
    });
});

export const myProfile = TryCatch(async(req: AuthenticatedRequest, res)=>{
    const user = req.user
    res.json(user);
})

export const updateName = TryCatch(async(req: AuthenticatedRequest, res)=>{
    const user = await User.findById(req.user?._id);

    if(!user) {
        res.status(404).json({
            message: "Please Login",
        });
        return;
    }
    user.name = req.body.name;
    await user.save();

    const token = generateToken(user);

    res.json({
        message: "User Updated",
        user,
        token
    });
});

export const getAllUsers = TryCatch(async (req: AuthenticatedRequest, res) => {
    const users = await User.find().select("name");
    res.json(users);
})

export const getAUser = TryCatch(async (req,res)=>{
    const user = await User.findById(req.params.id)
    res.json(user)
})