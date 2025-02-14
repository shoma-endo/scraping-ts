# スクレイピングAPIサーバー

## 環境要件

- Node.js (v16以上)
- npm (v8以上)

## セットアップ

1. リポジトリのクローン
```bash
git clone [リポジトリURL]
cd scraping-ts
```

2. 依存パッケージのインストール
```bash
npm install
```

## 使い方

### 開発モード

TypeScriptのコードを直接実行します：
```bash
npm run dev
```

### 本番モード

ビルドしてから実行します：
```bash
npm run build
npm start
```

### ファイル監視モード

ファイルの変更を監視して自動的にビルドします：
```bash
npm run watch
```

## APIエンドポイント

### GET /api/scrape

Amazonのベストセラーページから商品情報を取得します。

レスポンス例：
```json
{
  "products": [
    {
      "formattedDate": "2024-02-15",
      "rank": "#1",
      "title": "書籍タイトル",
      "author": "著者名",
      "url": "商品URL",
      "rating": "評価",
      "reviewCount": "レビュー数",
      "price": "価格"
    }
    // ...
  ]
}
```

## ライセンス

ISC

```bash
$ npm i puppeteer typescript ts-node
$ npx ts-node index.ts
```
