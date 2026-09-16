import type { NextFunction, Request, RequestHandler, Response } from "express"

const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async(req:Request, res:Response, next: NextFunction)=>{
        try{
            await handler(req, res, next)
        }catch(error){
            console.error(error);
            res.status(500).json({
                message: process.env.NODE_ENV === "development"
                    ? (error instanceof Error ? error.message : String(error))
                    : "Something went wrong. Please try again later."
            })
        }
    }
};

export default TryCatch
