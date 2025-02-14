import { scrapeAmazon } from "../scrapers/amazonScraper";

export const getScrapedData = async () => {
  return await scrapeAmazon();
};
