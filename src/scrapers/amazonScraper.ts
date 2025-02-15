import chromium from '@sparticuz/chromium';
import puppeteer from "puppeteer-core";

export interface Product {
	formattedDate: string;
  rank: string;
  title: string;
  author: string;
  url: string;
  rating: string;
  reviewCount: string;
  price: string;
}

export const scrapeAmazon = async (): Promise<Product[]> => {
  const browser = await puppeteer.launch({
    args: [
      ...chromium.args,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ],
    defaultViewport: {
      width: 1200,
      height: 800
    },
    executablePath: await chromium.executablePath(),
    headless: true,
    ignoreHTTPSErrors: true
  });

  try {
    const page = await browser.newPage();
    
    // パフォーマンス最適化
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      // 必要なリソースのみ読み込む
      const resourceType = request.resourceType();
      if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
        request.abort();
      } else {
        request.continue();
      }
    });

    // タイムアウトを5秒に設定
    await page.setDefaultNavigationTimeout(5000);
    await page.setDefaultTimeout(5000);

    await page.goto("https://www.amazon.co.jp/gp/bestsellers/digital-text/2275256051", {
      waitUntil: "domcontentloaded", // networkidle2より早い
      timeout: 5000
    });

    const products: Product[] = await page.$$eval('div[id^="p13n-asin-index-"]', (elements) => {
      return Array.from(elements).map((el) => {
        const now = new Date();
        const formattedDate = now.toISOString().split("T")[0];
        const rank = el.querySelector(".zg-bdg-text")?.textContent?.trim() || "";
        const textElements = el.querySelectorAll("div._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y");
        const title = textElements[0]?.textContent?.trim() || "";
        const author = textElements[1]?.textContent?.trim() || "";
        const urlPath = el.querySelector("div.p13n-sc-uncoverable-faceout a.a-link-normal")?.getAttribute("href") || "";
        const url = urlPath.startsWith("http") ? urlPath : `https://www.amazon.co.jp${urlPath}`;
        const rating = el.querySelector("i.a-icon span.a-icon-alt")?.textContent?.trim() || "";
        const reviewCount = el.querySelector('a.a-link-normal[title*="レーティング"] span.a-size-small')?.textContent?.trim() || "";
        const price = el.querySelector("span._cDEzb_p13n-sc-price_3mJ9Z")?.textContent?.trim() || "";

        return { formattedDate, rank, title, author, url, rating, reviewCount, price };
      });
    });

    await browser.close();
    return products;
  } catch (error) {
    await browser.close();
    console.error('スクレイピングエラー:', error);
    throw error;
  }
};
