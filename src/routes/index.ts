import { Router } from "express";
import UrlRouter from "./url";

const router = Router()

router.use("/url", UrlRouter)

export default router as Router