import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Amazonベストセラー Kindle本（例）のページURLにアクセス
  await page.goto('https://www.amazon.co.jp/gp/bestsellers/digital-text/2275256051', { waitUntil: 'networkidle2' });

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

  // 各商品の情報を抽出
  const products = await page.$$eval('div[id^="p13n-asin-index-"]', (elements) => {
    return Array.from(elements).map(el => {
      // ランキング（例：#1）
      const rank = el.querySelector('.zg-bdg-text')?.textContent?.trim() || '';

      // タイトルと著者は同じクラスのdiv要素に入っているので、順番で取得
      const textElements = el.querySelectorAll('div._cDEzb_p13n-sc-css-line-clamp-1_1Fn1y');
      const title = textElements[0]?.textContent?.trim() || '';
      const author = textElements[1]?.textContent?.trim() || '';

      // 評価（例："5つ星のうち4.6"）
      const rating = el.querySelector('i.a-icon span.a-icon-alt')?.textContent?.trim() || '';

      // レビュー数（例："557"）
      const reviewCount = el.querySelector('a.a-link-normal[title*="レーティング"] span.a-size-small')?.textContent?.trim() || '';

      // 価格（例："￥1,386"）
      const price = el.querySelector('span._cDEzb_p13n-sc-price_3mJ9Z')?.textContent?.trim() || '';

      // 商品URL（相対URLの場合、Amazon.co.jpを付加）
      const urlPath = el.querySelector('div.p13n-sc-uncoverable-faceout a.a-link-normal')?.getAttribute('href') || '';
      const url = urlPath.startsWith('http') ? urlPath : `https://www.amazon.co.jp${urlPath}`;

      return { rank, title, author, rating, reviewCount, price, url };
    });
  });

  // CSV用に変換
  const header = 'Rank,Title,Author,Rating,ReviewCount,Price,URL';
  const csvRows = products.map(p =>
    `"${p.rank}","${p.title.replace(/"/g, '""')}","${p.author.replace(/"/g, '""')}","${p.rating}","${p.reviewCount}","${p.price}","${p.url.replace(/"/g, '""')}"`
  );
  const csvContent = [header, ...csvRows].join('\n');
  fs.writeFileSync('output.csv', csvContent, 'utf8');
  console.log('CSV出力完了');

  await browser.close();
})();
