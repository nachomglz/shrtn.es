import { Router } from "express";
import UrlRouter from "./url";
import Controller from "../controllers";

const router = Router()

// Add Url Router
router.use("/url", UrlRouter)

// Redirect to Url
router.get("/:shortened_url", Controller.url.redirectToUrl)

export default router as Router