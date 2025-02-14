import puppeteer from "puppeteer";

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
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://www.amazon.co.jp/gp/bestsellers/digital-text/2275256051", { waitUntil: "networkidle2" });

  // ページの動的読み込みのために、末尾までスクロールする処理を追加
  let previousHeight;
  try {
    while (true) {
      previousHeight = await page.evaluate(() => document.body.scrollHeight);
      // ページの一番下までスクロール
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      // 3秒間待機して新たなコンテンツの読み込みを待つ（必要に応じて調整）
      await new Promise(resolve => setTimeout(resolve, 3000));
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      // 高さが変わらなければ、全てのコンテンツが読み込まれたと判断
      if (newHeight === previousHeight) break;
    }
    console.log('全てのコンテンツが読み込まれた可能性があります。');
  } catch (err) {
    console.error('スクロール処理中にエラー:', err);
  }

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
};
