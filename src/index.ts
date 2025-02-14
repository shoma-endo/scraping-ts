import express from "express";
import scraperRoutes from "./routes/scraperRoutes";

const app = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use("/api", scraperRoutes);

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: "リクエストされたエンドポイントが見つかりません。",
    path: req.path
  });
});

// グローバルエラーハンドリング
app.use((err: Error, _: express.Request, res: express.Response) => {
  console.error('エラーが発生しました:', err);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
});
