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
import { subscriptionRoutes } from "./modules/subscription/subscription.route";
import { stripe } from "./lib/stripe";

const app:Application=express();

app.use(cors({
    origin: config.app_url,
    credentials: true,
}))

const endpointSecret=config.stripe_webhook_secret;

// app.post("/api/subscription/webhook",express.raw({type: 'application/json'}),(request,response)=>{
//       let event = request.body;
//   // Only verify the event if you have an endpoint secret defined.
//   // Otherwise use the basic event deserialized with JSON.parse
//   if (endpointSecret) {
//     // Get the signature sent by Stripe
//     const signature = request.headers['stripe-signature'];
//     try {
//       event = stripe.webhooks.constructEvent(
//         request.body,
//         signature as string,
//         endpointSecret
//       );
//     } catch (err:any) {
//       console.log(`⚠️  Webhook signature verification failed.`, err.message);
//       return response.status(400).json(
//         {
//             message:err.message
//         }
//       );
//     }
//   }

//   // Handle the event
//   switch (event.type) {
//     case 'payment_intent.succeeded':
//       const paymentIntent = event.data.object;
//       console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
//       // Then define and call a method to handle the successful payment intent.
//       // handlePaymentIntentSucceeded(paymentIntent);
//       break;
//     case 'payment_method.attached':
//       const paymentMethod = event.data.object;
//       // Then define and call a method to handle the successful attachment of a PaymentMethod.
//       // handlePaymentMethodAttached(paymentMethod);
//       break;
//     default:
//       // Unexpected event type
//       console.log(`Unhandled event type ${event.type}.`);
//   }

//   // Return a 200 response to acknowledge receipt of the event
//   response.send();
// })

app.use("/api/subscription/webhook",express.raw({type: 'application/json'}))


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

app.use("/api/subscription",subscriptionRoutes)

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