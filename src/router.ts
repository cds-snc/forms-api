import { Router } from "express";
import { route as formsRoute } from "./routes/forms";
import { route as healthCheckRoute } from "./routes/healthCheck";

export const router = Router();

router.use("/status", healthCheckRoute);
router.use("/forms", formsRoute);
