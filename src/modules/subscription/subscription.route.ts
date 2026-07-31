import { Router } from "express";
import { subscriptionController } from "./subscription.controller";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";

const router = Router();


router.post("/checkout",auth(Role.USER,Role.ADMIN,Role.AUTHOR),subscriptionController.createCheckoutSession)


router.post("/webhook",subscriptionController.handleWebhook)

router.get("/status",auth(Role.USER,Role.ADMIN,Role.AUTHOR),subscriptionController.getSubscriptionStatus)
export const subscriptionRoutes=router;