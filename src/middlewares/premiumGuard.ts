import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { prisma } from "../lib/prisma";
import { SubscriptionStatus } from "../../generated/prisma/client";

export const subscriptionGuard=()=>{
    return catchAsync(async(req:Request,res:Response,next:NextFunction)=>{

    const userId=req.user?.id;
    const subscription=await prisma.subscription.findUnique({
        where:{
            userId
        }
    })
    if(!subscription){
        throw new Error("please subscribe to access this content");
    }
    if(subscription?.status!== SubscriptionStatus.ACTIVE){
        throw new Error("You are not authorized to access this resource. Please subscribe again to access premium content");
    }
    next();
})
}