import { Request, Response } from "express";
import { getScrapedData } from "../services/scrapingService";

export const scrapeAmazonHandler = async (_: Request, res: Response) => {
  try {
    const products = await getScrapedData();
    res.json({ products });
  } catch (error) {
    console.error("スクレイピング中にエラーが発生しました：", error);
    res.status(500).json({ error: "スクレイピングエラーです" });
  }
};
