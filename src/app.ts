import cookieParser from "cookie-parser";
import express,{ Application, ErrorRequestHandler, NextFunction, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import httpStatus from "http-status";
import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import { userRoutes } from "./modules/users/user.route";
import { authRoutes } from "./modules/auth/auth.routes";
import { postRoutes } from "./modules/post/post.route";
import { commentRoutes } from "./modules/comment/comment.route";
import { notFound } from "./middlewares/notFound";
import { globalErrorHandler } from "./middlewares/globalErrorHandeler";

const app:Application=express();

app.use(cors({
    origin: config.app_url,
    credentials: true,
}))

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());



app.get("/",async(req:Request,res:Response)=>{
    res.send("Hello World");
})

app.use("/api/users",userRoutes)


app.use("/api/auth",authRoutes)


app.use("/api/posts",postRoutes);
app.use("/api/comments",commentRoutes);

app.use(notFound)

// app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
//  res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         statusCode: httpStatus.INTERNAL_SERVER_ERROR,
//         message: err.message,
//         error: err.stack,
//       });
// })


app.use(globalErrorHandler)


export default app;