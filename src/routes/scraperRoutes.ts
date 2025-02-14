import { Router } from "express";
import { scrapeAmazonHandler } from "../controllers/scraperController";

const router = Router();
router.get("/scrape", scrapeAmazonHandler);

export default router;
