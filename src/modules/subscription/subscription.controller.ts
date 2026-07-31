import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { subscriptionService } from "./subscription.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { StringDecoder } from "node:string_decoder";

const createCheckoutSession=catchAsync(
    async (req:Request,res:Response,next:NextFunction)=>{
        const userId=req.user?.id;

        const result = await subscriptionService.createCheckoutSession(userId as string);
        sendResponse(res,{
            success:true,
            statusCode:httpStatus.OK,
            message:"Checkout session created successfully",
            data:result
        })
    }
)

const handleWebhook=catchAsync(
    async(req:Request,res:Response,next:NextFunction)=>{
        const event=req.body as Buffer;
        const signature=req.headers['stripe-signature']!;

        await subscriptionService.handleWebHook(event,signature as string);

        sendResponse(res,{
            success:true,
            statusCode:200,
            message:"Webhook received successfully",
            data:null
        })
    }
)

const getSubscriptionStatus=catchAsync(
    async(req:Request,res:Response,next:NextFunction)=>{
        const userId=req.user?.id;

        const result=await subscriptionService.getSubscriptionStatus(userId as string);

        sendResponse(res,{
            success:true,
            statusCode:httpStatus.OK,
            message:"Subscription status fetched successfully",
            data:result
        })
    }
)



export const subscriptionController={
    createCheckoutSession,
    handleWebhook,
    getSubscriptionStatus
}